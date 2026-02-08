import { Router, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as bookingService from '../services/booking.service';

const router = Router();

const createBookingSchema = z.object({
  username: z.string().min(1),
  eventSlug: z.string().min(1),
  startTime: z.string().datetime(),
  guestName: z.string().min(1, 'Name is required'),
  guestEmail: z.string().email('Invalid email'),
  guestTimezone: z.string().min(1),
  notes: z.string().optional(),
});

const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

// Create booking (public endpoint)
router.post('/', validateBody(createBookingSchema), async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Get all bookings for authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const filter = req.query.filter as 'upcoming' | 'past' | 'cancelled' | 'all' | undefined;
    const bookings = await bookingService.getBookingsForHost(req.user!.id, filter || 'all');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// Get single booking
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user!.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Cancel booking by host
router.patch('/:id/cancel', authMiddleware, validateBody(cancelBookingSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const booking = await bookingService.cancelBookingByHost(
      req.params.id,
      req.user!.id,
      req.body.reason
    );
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Cancel booking by token (public endpoint for guests)
router.post('/cancel/:token', validateBody(cancelBookingSchema), async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBookingByToken(
      req.params.token,
      req.body.reason
    );
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

export default router;
