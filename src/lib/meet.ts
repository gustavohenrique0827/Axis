// Proxy fino pro backend (/api/google-calendar/meet-space) — o browser nunca
// fala direto com meet.googleapis.com nem manuseia um access_token.
import { apiFetch } from "./apiClient";

export interface MeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
}

export const createMeetSpace = async (tenantId: string): Promise<MeetSpace> => {
  const res = await apiFetch("/api/google-calendar/meet-space", {
    method: "POST",
    headers: { "x-active-tenant-id": tenantId },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || "Failed to create Meet space");
  }
  return res.json();
};
