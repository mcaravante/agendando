import { PrismaClient, BookingStatus, IntegrationProvider } from '@prisma/client';
import { addMinutes } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.middleware';
import { sendBookingConfirmation, sendBookingCancellation } from './email.service';
import { generateICSString } from '../utils/ics';
import * as integrationService from './integrations';
import * as workflowService from './workflow.service';

const prisma = new PrismaClient();

export interface CreateBookingInput {
  username: string;
  eventSlug: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  notes?: string;
}

export async function createBooking(input: CreateBookingInput) {
  const { username, eventSlug, startTime, guestName, guestEmail, guestTimezone, notes } = input;

  // Get user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get event type
  const eventType = await prisma.eventType.findFirst({
    where: {
      userId: user.id,
      slug: eventSlug,
      isActive: true,
    },
  });

  if (!eventType) {
    throw new AppError('Event type not found', 404);
  }

  const startDateTime = new Date(startTime);
  const endDateTime = addMinutes(startDateTime, eventType.duration);

  // Check for conflicts using transaction to prevent race conditions
  const booking = await prisma.$transaction(async (tx) => {
    // Check for existing bookings at this time
    const existingBooking = await tx.booking.findFirst({
      where: {
        hostId: user.id,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lte: startDateTime } },
              { endTime: { gt: startDateTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endDateTime } },
              { endTime: { gte: endDateTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startDateTime } },
              { endTime: { lte: endDateTime } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      throw new AppError('This time slot is no longer available', 409);
    }

    // Create booking
    return tx.booking.create({
      data: {
        eventTypeId: eventType.id,
        hostId: user.id,
        guestName,
        guestEmail,
        guestTimezone,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
        cancellationToken: uuidv4(),
      },
      include: {
        eventType: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            timezone: true,
          },
        },
      },
    });
  });

  // Create calendar event if integration is connected
  let meetingUrl: string | undefined;

  try {
    const hasGoogleCalendar = await integrationService.hasIntegration(
      user.id,
      IntegrationProvider.GOOGLE_CALENDAR
    );

    if (hasGoogleCalendar) {
      const addMeetLink = eventType.location === 'meet';
      const calendarResult = await integrationService.createCalendarEvent({
        userId: user.id,
        bookingId: booking.id,
        title: `${eventType.title} con ${guestName}`,
        description: notes,
        startTime: booking.startTime,
        endTime: booking.endTime,
        hostEmail: user.email,
        guestEmail,
        guestName,
        location: eventType.location || undefined,
        addMeetLink,
      });
      if (calendarResult.meetingUrl) {
        meetingUrl = calendarResult.meetingUrl;
      }
    }
  } catch (error) {
    console.error('Failed to create calendar event:', error);
  }

  // Create Zoom meeting if location is zoom and Zoom is connected
  try {
    if (eventType.location === 'zoom') {
      const hasZoom = await integrationService.hasIntegration(user.id, IntegrationProvider.ZOOM);
      if (hasZoom) {
        const zoomResult = await integrationService.createZoomMeeting({
          userId: user.id,
          bookingId: booking.id,
          title: `${eventType.title} con ${guestName}`,
          startTime: booking.startTime,
          duration: eventType.duration,
          hostEmail: user.email,
          guestEmail,
          guestName,
        });
        meetingUrl = zoomResult.meetingUrl;
      }
    }
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error);
  }

  // Generate ICS
  const icsContent = generateICSString({
    id: booking.id,
    title: `${eventType.title} with ${user.name}`,
    description: notes,
    startTime: booking.startTime,
    endTime: booking.endTime,
    location: meetingUrl || eventType.location || undefined,
    hostName: user.name,
    hostEmail: user.email,
    guestName,
    guestEmail,
  });

  // Send confirmation emails (fire-and-forget)
  sendBookingConfirmation(booking, icsContent, meetingUrl)
    .catch((error) => console.error('Failed to send confirmation email:', error));

  // Trigger workflows
  try {
    await workflowService.triggerWorkflow('BOOKING_CREATED', booking);
    await workflowService.scheduleReminders(booking);
  } catch (error) {
    console.error('Failed to trigger workflows:', error);
  }

  return { ...booking, meetingUrl };
}

export async function getBookingsForHost(
  hostId: string,
  filter: 'upcoming' | 'past' | 'cancelled' | 'all' = 'all'
) {
  const now = new Date();

  let whereClause: any = { hostId };

  switch (filter) {
    case 'upcoming':
      whereClause.startTime = { gte: now };
      whereClause.status = 'CONFIRMED';
      break;
    case 'past':
      whereClause.endTime = { lt: now };
      whereClause.status = 'CONFIRMED';
      break;
    case 'cancelled':
      whereClause.status = 'CANCELLED';
      break;
  }

  return prisma.booking.findMany({
    where: whereClause,
    include: {
      eventType: true,
    },
    orderBy: { startTime: filter === 'past' ? 'desc' : 'asc' },
  });
}

export async function getBookingById(id: string, hostId?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      eventType: true,
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (hostId && booking.hostId !== hostId) {
    throw new AppError('Booking not found', 404);
  }

  return booking;
}

export async function cancelBookingByHost(id: string, hostId: string, reason?: string) {
  const booking = await getBookingById(id, hostId);

  if (booking.status === 'CANCELLED') {
    throw new AppError('Booking is already cancelled', 400);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    },
    include: {
      eventType: true,
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
  });

  // Send cancellation email (fire-and-forget)
  sendBookingCancellation(updatedBooking)
    .catch((error) => console.error('Failed to send cancellation email:', error));

  // Delete calendar event
  try {
    await integrationService.deleteCalendarEvent(id);
    await integrationService.deleteZoomMeeting(id);
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
  }

  // Trigger workflows and cancel reminders
  try {
    await workflowService.triggerWorkflow('BOOKING_CANCELLED', updatedBooking);
    await workflowService.cancelReminders(id);
  } catch (error) {
    console.error('Failed to trigger cancellation workflows:', error);
  }

  return updatedBooking;
}

export async function cancelBookingByToken(token: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { cancellationToken: token },
    include: {
      eventType: true,
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError('Booking is already cancelled', 400);
  }

  const updatedBooking = await prisma.booking.update({
    where: { cancellationToken: token },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    },
    include: {
      eventType: true,
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
  });

  // Send cancellation email (fire-and-forget)
  sendBookingCancellation(updatedBooking)
    .catch((error) => console.error('Failed to send cancellation email:', error));

  // Delete calendar event
  try {
    await integrationService.deleteCalendarEvent(booking.id);
    await integrationService.deleteZoomMeeting(booking.id);
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
  }

  // Trigger workflows and cancel reminders
  try {
    await workflowService.triggerWorkflow('BOOKING_CANCELLED', updatedBooking);
    await workflowService.cancelReminders(booking.id);
  } catch (error) {
    console.error('Failed to trigger cancellation workflows:', error);
  }

  return updatedBooking;
}
