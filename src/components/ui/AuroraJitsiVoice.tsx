import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { JitsiMeetJS: any }
}

export type AuroraVoiceStatus = "connecting" | "connected" | "speaking" | "error" | "idle";

interface PendingSpeech {
  id: string;
  audioBase64: string;
}

interface AuroraJitsiVoiceProps {
  roomName: string;
  active: boolean;
  pendingSpeech: PendingSpeech | null;
}

function loadLibJitsiMeet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetJS) { resolve(); return; }
    const existing = document.querySelector('script[src*="lib-jitsi-meet"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/libs/lib-jitsi-meet.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * A Aurora como uma segunda participante de verdade na sala do Jitsi — não é o vídeo do
 * usuário humano (isso continua em JitsiEmbed.tsx, via external_api.js, intocado). Aqui é uma
 * conexão de baixo nível própria (lib-jitsi-meet) que entra na MESMA sala como "Aurora — IA",
 * sem câmera, e publica a fala dela (audioBase64 vindo do /api/ai/aurora-chat) como a própria
 * faixa de áudio dessa participante — todo mundo na call ouve, como se fosse mais uma pessoa.
 *
 * Primeira vez que este projeto usa lib-jitsi-meet (o resto do Axis usa só o external_api.js,
 * que não expõe injeção de áudio sintético) — precisa de teste ao vivo numa sala real antes de
 * considerar validado; a política de autoplay do navegador também depende de já ter havido um
 * gesto do usuário na página (o clique que abre a sala já cobre isso).
 */
export function AuroraJitsiVoice({ roomName, active, pendingSpeech }: AuroraJitsiVoiceProps) {
  const [status, setStatus] = useState<AuroraVoiceStatus>("idle");
  const connectionRef = useRef<any>(null);
  const roomRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active || !roomName) return;
    let disposed = false;

    async function init() {
      try {
        setStatus("connecting");
        await loadLibJitsiMeet();
        if (disposed) return;

        const JitsiMeetJS = window.JitsiMeetJS;
        JitsiMeetJS.init({ disableAudioLevels: true });

        const connection = new JitsiMeetJS.JitsiConnection(null, null, {
          hosts: { domain: "meet.jit.si", muc: `conference.meet.jit.si` },
          serviceUrl: `wss://meet.jit.si/xmpp-websocket?room=${roomName.toLowerCase()}`,
          clientNode: "http://jitsi.org/jitsimeet",
        });
        connectionRef.current = connection;

        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => {
          if (disposed) return;
          const room = connection.initJitsiConference(roomName.toLowerCase(), {
            openBridgeChannel: true,
          });
          roomRef.current = room;
          room.setDisplayName("Aurora — IA");
          room.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
            if (!disposed) setStatus("connected");
          });
          room.join();
        });

        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, () => {
          if (!disposed) setStatus("error");
        });

        connection.connect();
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        if (!disposed) setStatus("error");
      }
    }

    init();

    return () => {
      disposed = true;
      try { roomRef.current?.leave(); } catch {}
      try { connectionRef.current?.disconnect(); } catch {}
      try { audioCtxRef.current?.close(); } catch {}
      roomRef.current = null;
      connectionRef.current = null;
      audioCtxRef.current = null;
      setStatus("idle");
    };
  }, [active, roomName]);

  // Toca (e publica na call) a fala mais recente que o hook de presença decidiu que vale
  // interromper — cada pendingSpeech novo (id diferente) dispara uma única execução.
  useEffect(() => {
    if (!pendingSpeech || pendingSpeech.id === lastSpokenIdRef.current) return;
    const room = roomRef.current;
    const audioCtx = audioCtxRef.current;
    if (!room || !audioCtx || status !== "connected") return;

    lastSpokenIdRef.current = pendingSpeech.id;

    (async () => {
      try {
        setStatus("speaking");
        const buffer = await audioCtx.decodeAudioData(base64ToArrayBuffer(pendingSpeech.audioBase64));
        const destination = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(destination);

        const JitsiMeetJS = window.JitsiMeetJS;
        const [localTrack] = await JitsiMeetJS.createLocalTracksFromMediaStreams([
          {
            stream: destination.stream,
            track: destination.stream.getAudioTracks()[0],
            mediaType: "audio",
            videoType: null,
          },
        ]);
        await room.replaceTrack(room.getLocalAudioTrack?.() ?? null, localTrack);

        source.onended = () => {
          if (roomRef.current === room) setStatus("connected");
        };
        source.start();
      } catch {
        setStatus("connected");
      }
    })();
  }, [pendingSpeech, status]);

  return null;
}
