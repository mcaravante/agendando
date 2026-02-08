import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get all contacts (unique guests from bookings)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // Get all bookings for this user with guest info
    const bookings = await prisma.booking.findMany({
      where: {
        hostId: userId,
      },
      select: {
        guestName: true,
        guestEmail: true,
        startTime: true,
        status: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Group by email to get unique contacts
    const contactsMap = new Map<string, {
      name: string;
      email: string;
      lastMeetingDate: Date | null;
      nextMeetingDate: Date | null;
      totalMeetings: number;
    }>();

    const now = new Date();

    for (const booking of bookings) {
      const email = booking.guestEmail.toLowerCase();
      const existing = contactsMap.get(email);
      const bookingTime = new Date(booking.startTime);
      const isPast = bookingTime < now;
      const isConfirmed = booking.status === 'CONFIRMED';

      if (!existing) {
        contactsMap.set(email, {
          name: booking.guestName,
          email: booking.guestEmail,
          lastMeetingDate: isPast && isConfirmed ? bookingTime : null,
          nextMeetingDate: !isPast && isConfirmed ? bookingTime : null,
          totalMeetings: isConfirmed ? 1 : 0,
        });
      } else {
        // Update last meeting date (most recent past meeting)
        if (isPast && isConfirmed) {
          if (!existing.lastMeetingDate || bookingTime > existing.lastMeetingDate) {
            existing.lastMeetingDate = bookingTime;
          }
        }
        // Update next meeting date (earliest future meeting)
        if (!isPast && isConfirmed) {
          if (!existing.nextMeetingDate || bookingTime < existing.nextMeetingDate) {
            existing.nextMeetingDate = bookingTime;
          }
        }
        if (isConfirmed) {
          existing.totalMeetings++;
        }
      }
    }

    const contacts = Array.from(contactsMap.values()).map((contact, index) => ({
      id: `contact-${index}`,
      ...contact,
      phoneNumber: null, // Not captured in bookings
      company: null, // Not captured in bookings
    }));

    // Sort by name
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

export default router;
