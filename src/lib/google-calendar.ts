export interface CalendarEvent {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
}

export async function createCalendarEvent(
  accessToken: string,
  params: {
    title: string;
    description: string;
    startISO: string;
    endISO: string;
    attendeeEmails: string[];
    meetLink?: string;
  }
): Promise<CalendarEvent> {
  const requestId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const body = {
    summary: params.title,
    description: params.description,
    start: {
      dateTime: params.startISO,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: params.endISO,
      timeZone: 'America/Sao_Paulo',
    },
    attendees: params.attendeeEmails.filter(Boolean).map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to create calendar event');
  }

  const data = await res.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    hangoutLink: data.hangoutLink,
  };
}
