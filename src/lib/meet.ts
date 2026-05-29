export interface MeetSpace {
  name: string;
  meetingUri: string;
  meetingCode: string;
}

export const createMeetSpace = async (accessToken: string): Promise<MeetSpace> => {
  const res = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to create Meet space');
  }

  const data = await res.json();
  return {
    name: data.name,
    meetingUri: data.meetingUri,
    meetingCode: data.meetingCode
  };
};
