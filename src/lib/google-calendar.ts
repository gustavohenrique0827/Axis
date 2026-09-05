export interface CalendarEvent {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
}

export interface GoogleCalendarApiEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  status?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string; label?: string }>;
  };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string; self?: boolean }>;
  organizer?: { email?: string; displayName?: string; self?: boolean };
  creator?: { email?: string; displayName?: string; self?: boolean };
}

export async function createCalendarEvent(
  accessToken: string,
  params: {
    title: string;
    description: string;
    startISO: string;
    endISO: string;
    attendeeEmails: string[];
    /** true = Sala S.P.Y. (Jitsi link na descrição, sem criar Google Meet) */
    skipConferenceData?: boolean;
  }
): Promise<CalendarEvent> {
  const url = params.skipConferenceData
    ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all'
    : 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all';

  const body: Record<string, unknown> = {
    summary: params.title,
    description: params.description,
    start: { dateTime: params.startISO, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: params.endISO, timeZone: 'America/Sao_Paulo' },
    attendees: params.attendeeEmails.filter(Boolean).map((email) => ({ email })),
  };

  if (!params.skipConferenceData) {
    body.conferenceData = {
      createRequest: {
        requestId: Math.random().toString(36).substring(2),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || 'Falha ao criar evento no Google Calendar');
  }
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink, hangoutLink: data.hangoutLink };
}

export async function listGoogleCalendarEvents(
  accessToken: string,
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }
): Promise<GoogleCalendarApiEvent[]> {
  const timeMin = options?.timeMin || new Date(Date.now() - 30 * 86400000).toISOString();
  const timeMax = options?.timeMax || new Date(Date.now() + 90 * 86400000).toISOString();
  const maxResults = options?.maxResults || 250;

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', String(maxResults));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || 'Falha ao buscar eventos do Google Calendar');
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarApiEvent[];
}

export function mapGoogleEventToReuniao(
  event: GoogleCalendarApiEvent,
  closerFallback = "Google Calendar"
) {
  const startISO = event.start?.dateTime
    ? new Date(event.start.dateTime).toISOString()
    : event.start?.date
    ? new Date(`${event.start.date}T09:00:00`).toISOString()
    : new Date().toISOString();

  const endISO = event.end?.dateTime
    ? new Date(event.end.dateTime).toISOString()
    : event.end?.date
    ? new Date(`${event.end.date}T10:00:00`).toISOString()
    : new Date(Date.now() + 3600000).toISOString();

  const durationMinutes = Math.max(
    15,
    Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000)
  ) || 60;

  const attendees = event.attendees || [];
  const otherAttendee = attendees.find((a) => !a.self) || attendees[0];
  const leadName = otherAttendee?.displayName || otherAttendee?.email || event.summary || "Compromisso Google Calendar";
  const leadEmail = otherAttendee?.email || "";
  const meetLink =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((e) => e.uri)?.uri ||
    event.htmlLink ||
    "";

  return {
    id: `gcal-${event.id}`,
    leadId: `gcal-${event.id}`,
    leadName,
    companyName: event.summary || "Google Calendar",
    leadEmail,
    closerName: closerFallback,
    closerEmail: event.organizer?.email || "",
    scheduledAt: startISO,
    durationMinutes,
    meetLink,
    googleEventId: event.id,
    status: (event.status === "cancelled" ? "Cancelada" : "Agendada") as "Agendada" | "Cancelada",
    pauta: event.description || (event.summary ? `Evento: ${event.summary}` : "Sincronizado da agenda do Google"),
  };
}
