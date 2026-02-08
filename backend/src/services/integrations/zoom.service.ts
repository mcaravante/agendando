import { PrismaClient, IntegrationProvider } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

const prisma = new PrismaClient();

interface ZoomTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface ZoomUserResponse {
  email: string;
  id: string;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  topic: string;
}

const ZOOM_AUTH_URL = 'https://zoom.us/oauth/authorize';
const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_URL = 'https://api.zoom.us/v2';

function getZoomConfig() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError('Zoom OAuth not configured', 500);
  }

  return { clientId, clientSecret, redirectUri };
}

export function getZoomAuthUrl(userId: string): string {
  const { clientId, redirectUri } = getZoomConfig();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: userId,
  });

  return `${ZOOM_AUTH_URL}?${params.toString()}`;
}

export async function handleZoomCallback(code: string, userId: string) {
  const { clientId, clientSecret, redirectUri } = getZoomConfig();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenResponse = await fetch(ZOOM_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Zoom token error:', error);
    throw new AppError('Failed to get access token from Zoom', 400);
  }

  const tokens = await tokenResponse.json() as ZoomTokenResponse;

  // Get user info
  const userResponse = await fetch(`${ZOOM_API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  });

  let accountEmail: string | null = null;
  if (userResponse.ok) {
    const userData = await userResponse.json() as ZoomUserResponse;
    accountEmail = userData.email;
  }

  // Calculate expiration
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  // Save or update integration
  const integration = await prisma.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.ZOOM,
      },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      accountEmail,
      isActive: true,
    },
    create: {
      userId,
      provider: IntegrationProvider.ZOOM,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      accountEmail,
    },
  });

  return integration;
}

async function getAccessToken(userId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.ZOOM,
      },
    },
  });

  if (!integration || !integration.isActive) {
    throw new AppError('Zoom not connected', 400);
  }

  // Check if token needs refresh
  if (integration.expiresAt && new Date() >= integration.expiresAt) {
    if (!integration.refreshToken) {
      throw new AppError('Zoom token expired and no refresh token available', 400);
    }

    const { clientId, clientSecret } = getZoomConfig();
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(ZOOM_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      throw new AppError('Failed to refresh Zoom token', 400);
    }

    const tokens = await tokenResponse.json() as ZoomTokenResponse;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || integration.refreshToken,
        expiresAt,
      },
    });

    return tokens.access_token;
  }

  return integration.accessToken;
}

export interface CreateZoomMeetingInput {
  userId: string;
  bookingId: string;
  title: string;
  startTime: Date;
  duration: number; // in minutes
  hostEmail: string;
  guestEmail: string;
  guestName: string;
}

export async function createZoomMeeting(input: CreateZoomMeetingInput) {
  const {
    userId,
    bookingId,
    title,
    startTime,
    duration,
    guestName,
  } = input;

  const accessToken = await getAccessToken(userId);

  const meetingData = {
    topic: title,
    type: 2, // Scheduled meeting
    start_time: startTime.toISOString(),
    duration,
    timezone: 'UTC',
    agenda: `Meeting with ${guestName}`,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: false,
      watermark: false,
      waiting_room: true,
      meeting_invitees: [],
    },
  };

  const response = await fetch(`${ZOOM_API_URL}/users/me/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Zoom meeting creation error:', error);
    throw new AppError('Failed to create Zoom meeting', 500);
  }

  const meeting = await response.json() as ZoomMeetingResponse;

  // Save calendar event reference
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      bookingId,
      provider: 'ZOOM',
      externalEventId: meeting.id.toString(),
      meetingUrl: meeting.join_url,
    },
  });

  return {
    meetingId: meeting.id,
    meetingUrl: meeting.join_url,
    startUrl: meeting.start_url,
    calendarEvent,
  };
}

export async function deleteZoomMeeting(bookingId: string) {
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: { bookingId },
    include: { booking: { include: { host: true } } },
  });

  if (!calendarEvent || calendarEvent.provider !== 'ZOOM') {
    return null;
  }

  try {
    const accessToken = await getAccessToken(calendarEvent.booking.hostId);

    const response = await fetch(
      `${ZOOM_API_URL}/meetings/${calendarEvent.externalEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      console.error('Error deleting Zoom meeting:', await response.text());
    }

    await prisma.calendarEvent.delete({
      where: { id: calendarEvent.id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    return false;
  }
}

export async function disconnectZoom(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.ZOOM,
      },
    },
  });

  if (!integration) {
    throw new AppError('Zoom not connected', 404);
  }

  // Revoke token
  try {
    const { clientId, clientSecret } = getZoomConfig();
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    await fetch(`https://zoom.us/oauth/revoke?token=${integration.accessToken}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });
  } catch (error) {
    console.error('Error revoking Zoom token:', error);
  }

  // Delete integration
  await prisma.integration.delete({
    where: { id: integration.id },
  });

  return true;
}
