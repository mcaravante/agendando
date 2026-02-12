import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export async function joinWaitlist(
  username: string,
  eventSlug: string,
  guestName: string,
  guestEmail: string
) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const eventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug: eventSlug, isActive: true },
  });

  if (!eventType) {
    throw new AppError('Event type not found', 404);
  }

  // Upsert: re-joining updates name and timestamp
  const entry = await prisma.waitlistEntry.upsert({
    where: {
      eventTypeId_guestEmail: {
        eventTypeId: eventType.id,
        guestEmail,
      },
    },
    update: {
      guestName,
      createdAt: new Date(),
    },
    create: {
      eventTypeId: eventType.id,
      guestName,
      guestEmail,
    },
  });

  return entry;
}

interface BookingWithEventType {
  eventTypeId: string;
  eventType: {
    title: string;
  };
  host: {
    username: string;
  };
}

export async function notifyWaitlist(booking: BookingWithEventType) {
  try {
    const entries = await prisma.waitlistEntry.findMany({
      where: { eventTypeId: booking.eventTypeId },
    });

    if (entries.length === 0) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const bookingPageUrl = `${frontendUrl}/${booking.host.username}`;

    for (const entry of entries) {
      await prisma.job.create({
        data: {
          type: 'SEND_EMAIL',
          data: {
            to: entry.guestEmail,
            subject: `Hay disponibilidad: ${booking.eventType.title}`,
            body: `<p>Hola ${entry.guestName},</p>
<p>Se liberó un lugar en <strong>${booking.eventType.title}</strong>.</p>
<p>Reservá tu horario ahora:</p>
<p><a href="${bookingPageUrl}" style="display:inline-block;background:#3b82f6;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;">Reservar ahora</a></p>
<p style="color:#6b7280;font-size:14px;">Si ya no estás interesado, simplemente ignorá este mensaje.</p>`,
          },
          scheduledAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Failed to notify waitlist:', error);
  }
}

export async function removeFromWaitlist(eventTypeId: string, guestEmail: string) {
  try {
    await prisma.waitlistEntry.deleteMany({
      where: { eventTypeId, guestEmail },
    });
  } catch (error) {
    console.error('Failed to remove from waitlist:', error);
  }
}
