import { OAuth2Client } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import { PrismaClient, IntegrationProvider } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

const prisma = new PrismaClient();

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
];

function getOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError('Google OAuth not configured', 500);
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(userId: string): string {
  const client = getOAuth2Client();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId,
    prompt: 'consent',
  });

  return url;
}

export async function handleGoogleCallback(code: string, userId: string) {
  const client = getOAuth2Client();

  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new AppError('Failed to get access token from Google', 400);
  }

  client.setCredentials(tokens);

  // Get user email
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const userInfo = await oauth2.userinfo.get();
  const accountEmail = userInfo.data.email;

  // Calculate expiration
  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  // Save or update integration
  const integration = await prisma.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt,
      accountEmail,
      isActive: true,
    },
    create: {
      userId,
      provider: IntegrationProvider.GOOGLE_CALENDAR,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt,
      accountEmail,
    },
  });

  return integration;
}

async function getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    },
  });

  if (!integration || !integration.isActive) {
    throw new AppError('Google Calendar not connected', 400);
  }

  const client = getOAuth2Client();

  client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: integration.expiresAt?.getTime(),
  });

  // Check if token needs refresh
  if (integration.expiresAt && new Date() >= integration.expiresAt) {
    if (!integration.refreshToken) {
      throw new AppError('Google token expired and no refresh token available', 400);
    }

    const { credentials } = await client.refreshAccessToken();

    // Update stored tokens
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: credentials.access_token!,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      },
    });

    client.setCredentials(credentials);
  }

  return client;
}

export interface CreateCalendarEventInput {
  userId: string;
  bookingId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  hostEmail: string;
  guestEmail: string;
  guestName: string;
  location?: string;
  addMeetLink?: boolean;
}

export async function createCalendarEvent(input: CreateCalendarEventInput) {
  const {
    userId,
    bookingId,
    title,
    description,
    startTime,
    endTime,
    hostEmail,
    guestEmail,
    guestName,
    location,
    addMeetLink,
  } = input;

  const client = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: client });

  const event: calendar_v3.Schema$Event = {
    summary: title,
    description: description || `Reserva con ${guestName}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC',
    },
    attendees: [
      { email: hostEmail },
      { email: guestEmail, displayName: guestName },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  if (location) {
    event.location = location;
  }

  // Add Google Meet link if requested
  if (addMeetLink) {
    event.conferenceData = {
      createRequest: {
        requestId: bookingId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: addMeetLink ? 1 : 0,
    sendUpdates: 'all',
  });

  const meetingUrl = response.data.conferenceData?.entryPoints?.find(
    (ep) => ep.entryPointType === 'video'
  )?.uri;

  // Save calendar event reference
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      bookingId,
      provider: 'GOOGLE_CALENDAR',
      externalEventId: response.data.id!,
      meetingUrl,
    },
  });

  return {
    eventId: response.data.id,
    meetingUrl,
    calendarEvent,
  };
}

export async function deleteCalendarEvent(bookingId: string) {
  const calendarEvent = await prisma.calendarEvent.findUnique({
    where: { bookingId },
    include: { booking: { include: { host: true } } },
  });

  if (!calendarEvent || calendarEvent.provider !== 'GOOGLE_CALENDAR') {
    return null;
  }

  try {
    const client = await getAuthenticatedClient(calendarEvent.booking.hostId);
    const calendar = google.calendar({ version: 'v3', auth: client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: calendarEvent.externalEventId,
      sendUpdates: 'all',
    });

    await prisma.calendarEvent.delete({
      where: { id: calendarEvent.id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return false;
  }
}

export async function disconnectGoogle(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: IntegrationProvider.GOOGLE_CALENDAR,
      },
    },
  });

  if (!integration) {
    throw new AppError('Google Calendar not connected', 404);
  }

  // Revoke token
  try {
    const client = getOAuth2Client();
    client.setCredentials({ access_token: integration.accessToken });
    await client.revokeCredentials();
  } catch (error) {
    console.error('Error revoking Google token:', error);
  }

  // Delete integration
  await prisma.integration.delete({
    where: { id: integration.id },
  });

  return true;
}
