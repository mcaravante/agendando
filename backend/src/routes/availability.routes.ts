import { Router, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as availabilityService from '../services/availability.service';

const router = Router();

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
});

const updateAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema),
});

const updateConfigSchema = z.object({
  bufferBefore: z.number().min(0).max(120).optional(),
  bufferAfter: z.number().min(0).max(120).optional(),
  minNotice: z.number().min(0).max(10080).optional(), // up to 1 week
  maxDaysInAdvance: z.number().min(1).max(365).optional(),
});

const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  isBlocked: z.boolean().optional(),
  slots: z.array(z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  })).optional(),
});

// Get availability
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const availability = await availabilityService.getAvailability(req.user!.id);
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Update availability
router.put('/', authMiddleware, validateBody(updateAvailabilitySchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const availability = await availabilityService.updateAvailability(
      req.user!.id,
      req.body.slots
    );
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

// Get scheduling config
router.get('/config', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const config = await availabilityService.getSchedulingConfig(req.user!.id);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Update scheduling config
router.patch('/config', authMiddleware, validateBody(updateConfigSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const config = await availabilityService.updateSchedulingConfig(
      req.user!.id,
      req.body
    );
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Get date overrides
router.get('/overrides', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const overrides = await availabilityService.getDateOverrides(req.user!.id);
    res.json(overrides);
  } catch (error) {
    next(error);
  }
});

// Set date override
router.post('/overrides', authMiddleware, validateBody(dateOverrideSchema), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const date = new Date(req.body.date);
    const { date: _, ...data } = req.body;

    const overrides = await availabilityService.setDateOverrides(
      req.user!.id,
      date,
      data
    );
    res.json(overrides);
  } catch (error) {
    next(error);
  }
});

// Delete date override
router.delete('/overrides/:date', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const date = new Date(req.params.date);
    await availabilityService.deleteDateOverride(req.user!.id, date);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
