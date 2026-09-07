import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

export interface InternalChannel {
  id: string;
  name: string;
  type: "geral" | "squad" | "direct";
  squad_id?: string | null;
  member_ids?: string[];
  description?: string;
  unread?: number;
  lastMessage?: string;
  lastAt?: string;
}

export interface InternalMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
}

interface OtherUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

export function useInternalChat() {
  const { user, activeTenantId } = useAuth();
  const tenantId = activeTenantId || user?.tenantId;
  const senderName = user?.name || "Usuário";

  const [channels, setChannels] = useState<InternalChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, InternalMessage[]>>({});
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const realtimeRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Ensure Geral channel exists, load all channels + squads
  const loadChannels = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Ensure "geral" channel exists for this tenant
    const { data: existing } = await supabase
      .from("internal_channels")
      .select("id")
      .eq("type", "geral")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("internal_channels").insert({
        tenant_id: tenantId,
        name: "geral",
        type: "geral",
        description: "Canal geral da empresa",
      });
    }

    // Load squads to create squad channels
    const { data: squads } = await supabase
      .from("squads")
      .select("id, nome")
      .eq("tenant_id", tenantId);

    if (squads) {
      for (const sq of squads) {
        const { data: sqCh } = await supabase
          .from("internal_channels")
          .select("id")
          .eq("type", "squad")
          .eq("squad_id", sq.id)
          .eq("tenant_id", tenantId)
          .maybeSingle();
        if (!sqCh) {
          await supabase.from("internal_channels").insert({
            tenant_id: tenantId,
            name: sq.nome,
            type: "squad",
            squad_id: sq.id,
          });
        }
      }
    }

    // Load all channels
    const { data: chs } = await supabase
      .from("internal_channels")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    if (chs && chs.length > 0) {
      // Fetch last message per channel in one query
      const channelIds = chs.map(c => c.id);
      const { data: lastMsgs } = await supabase
        .from("internal_messages")
        .select("channel_id, content, sender_name, created_at")
        .in("channel_id", channelIds)
        .order("created_at", { ascending: false })
        .limit(channelIds.length * 10);

      const lastMsgMap: Record<string, { content: string; created_at: string }> = {};
      if (lastMsgs) {
        for (const m of lastMsgs) {
          if (!lastMsgMap[m.channel_id]) lastMsgMap[m.channel_id] = m;
        }
      }

      setChannels(chs.map(ch => ({
        ...ch,
        lastMessage: lastMsgMap[ch.id]?.content,
        lastAt: lastMsgMap[ch.id]?.created_at,
      })) as InternalChannel[]);
    } else {
      setChannels((chs ?? []) as InternalChannel[]);
    }
    setLoading(false);
  }, [tenantId]);

  // Load messages for a channel
  const loadMessages = useCallback(async (channelId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("internal_messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) {
      setMessages(prev => ({ ...prev, [channelId]: data as InternalMessage[] }));
    }
  }, []);

  // Load other users for DMs
  const loadUsers = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("users")
      .select("id, name, email, avatar_url, role")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .neq("email", user?.email || "");
    if (data) setOtherUsers(data as OtherUser[]);
  }, [tenantId, user?.email]);

  // Subscribe to realtime on active channel
  useEffect(() => {
    if (!supabase || !activeChannelId) return;

    realtimeRef.current?.unsubscribe();

    const sub = supabase
      .channel(`internal_msg_${activeChannelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "internal_messages", filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          const msg = payload.new as InternalMessage;
          setMessages(prev => ({
            ...prev,
            [activeChannelId]: [...(prev[activeChannelId] || []), msg],
          }));
        }
      )
      .subscribe();

    realtimeRef.current = sub;
    return () => { sub.unsubscribe(); };
  }, [activeChannelId]);

  useEffect(() => {
    loadChannels();
    loadUsers();
  }, [loadChannels, loadUsers]);

  useEffect(() => {
    if (activeChannelId) loadMessages(activeChannelId);
  }, [activeChannelId, loadMessages]);

  // Auto-select first channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const sendMessageText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !activeChannelId) return;

    const now = new Date().toISOString();
    const msg: Omit<InternalMessage, "id"> = {
      channel_id: activeChannelId,
      sender_id: user?.email || "anon",
      sender_name: senderName,
      sender_avatar: undefined,
      content: trimmed,
      created_at: now,
    };

    // Optimistically update channel preview
    setChannels(prev => prev.map(ch =>
      ch.id === activeChannelId ? { ...ch, lastMessage: trimmed, lastAt: now } : ch
    ));

    if (!supabase) {
      const fakeMsg = { ...msg, id: crypto.randomUUID() } as InternalMessage;
      setMessages(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), fakeMsg] }));
      return;
    }

    await supabase.from("internal_messages").insert({ ...msg, tenant_id: tenantId });
  }, [activeChannelId, user, senderName, tenantId]);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    await sendMessageText(text);
  }, [inputText, sendMessageText]);

  const openDirectMessage = useCallback(async (other: OtherUser) => {
    if (!supabase) return;
    const myEmail = user?.email || "";
    const memberIds = [myEmail, other.email].sort();
    const dmName = `${senderName} & ${other.name}`;

    // Check if DM channel exists
    let { data: existing } = await supabase
      .from("internal_channels")
      .select("*")
      .eq("type", "direct")
      .eq("tenant_id", tenantId)
      .contains("member_ids", memberIds)
      .maybeSingle();

    if (!existing) {
      const { data: created } = await supabase
        .from("internal_channels")
        .insert({ tenant_id: tenantId, name: dmName, type: "direct", member_ids: memberIds })
        .select()
        .maybeSingle();
      existing = created;
    }

    if (existing) {
      setChannels(prev => {
        const has = prev.find(c => c.id === existing!.id);
        return has ? prev : [...prev, existing as InternalChannel];
      });
      setActiveChannelId(existing.id);
    }
  }, [supabase, user?.email, senderName, tenantId]);

  const geralChannels = channels.filter(c => c.type === "geral");
  const squadChannels = channels.filter(c => c.type === "squad");
  const directChannels = channels.filter(c => c.type === "direct");
  const activeMessages = activeChannelId ? (messages[activeChannelId] || []) : [];
  const activeChannel = channels.find(c => c.id === activeChannelId) || null;

  return {
    channels, geralChannels, squadChannels, directChannels,
    activeChannelId, setActiveChannelId, activeChannel,
    activeMessages, otherUsers,
    inputText, setInputText,
    loading, sendMessage, sendMessageText, openDirectMessage,
    senderName,
  };
}
