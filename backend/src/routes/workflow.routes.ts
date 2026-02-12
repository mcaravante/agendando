import { Router, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as workflowService from '../services/workflow.service';
import { PrismaClient, TriggerType, ActionType } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

const VALID_PLACEHOLDERS = ['guestName', 'guestEmail', 'hostName', 'eventTitle', 'startTime', 'duration'];

const emailConfigSchema = z.object({
  to: z.string().min(1),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
}).refine((data) => {
  // Validate no script/event handler injection in subject or body
  const dangerous = /<script[\s>]|javascript:|on\w+\s*=/i;
  return !dangerous.test(data.subject) && !dangerous.test(data.body);
}, { message: 'Content contains disallowed HTML or scripts' })
.refine((data) => {
  // Validate all placeholders are known
  const allVars = [...(data.subject.match(/\{\{(\w+)\}\}/g) || []), ...(data.body.match(/\{\{(\w+)\}\}/g) || [])];
  return allVars.every(v => VALID_PLACEHOLDERS.includes(v.replace(/\{|\}/g, '')));
}, { message: 'Unknown placeholder variable' });

const webhookConfigSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional(),
});

const actionSchema = z.object({
  type: z.nativeEnum(ActionType),
  config: z.any(),
}).refine((action) => {
  if (action.type === 'SEND_EMAIL') {
    return emailConfigSchema.safeParse(action.config).success;
  }
  if (action.type === 'SEND_WEBHOOK') {
    return webhookConfigSchema.safeParse(action.config).success;
  }
  return true;
}, { message: 'Invalid action config' });

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  triggers: z.array(
    z.object({
      type: z.nativeEnum(TriggerType),
      config: z.any().optional(),
    })
  ).min(1, 'At least one trigger is required'),
  actions: z.array(actionSchema).min(1, 'At least one action is required'),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  triggers: z.array(
    z.object({
      type: z.nativeEnum(TriggerType),
      config: z.any().optional(),
    })
  ).optional(),
  actions: z.array(actionSchema).optional(),
});

// Get all workflows for current user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const workflows = await workflowService.getWorkflows(req.user!.id);
    res.json(workflows);
  } catch (error) {
    next(error);
  }
});

// Get delivery log (jobs) for current user
router.get('/jobs', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Sanitize data → summary
    const sanitized = jobs.map((job) => {
      const data = job.data as any;
      let summary: Record<string, string> = {};

      if (job.type === 'SEND_EMAIL' || job.type === 'REMINDER_SEND_EMAIL') {
        summary = { to: data?.to || data?.actionConfig?.to || '', subject: data?.subject || '' };
      } else if (job.type === 'SEND_WEBHOOK' || job.type === 'REMINDER_SEND_WEBHOOK') {
        summary = { url: data?.url || data?.actionConfig?.url || '', method: data?.method || data?.actionConfig?.method || 'POST' };
      }

      return {
        id: job.id,
        type: job.type,
        status: job.status,
        attempts: job.attempts,
        error: job.error,
        scheduledAt: job.scheduledAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
        summary,
      };
    });

    res.json({
      jobs: sanitized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single workflow
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user!.id);
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

// Create workflow
router.post(
  '/',
  authMiddleware,
  validateBody(createWorkflowSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const workflow = await workflowService.createWorkflow({
        userId: req.user!.id,
        ...req.body,
      });
      res.status(201).json(workflow);
    } catch (error) {
      next(error);
    }
  }
);

// Update workflow
router.patch(
  '/:id',
  authMiddleware,
  validateBody(updateWorkflowSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const workflow = await workflowService.updateWorkflow(
        req.params.id,
        req.user!.id,
        req.body
      );
      res.json(workflow);
    } catch (error) {
      next(error);
    }
  }
);

// Delete workflow
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await workflowService.deleteWorkflow(req.params.id, req.user!.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    next(error);
  }
});

// Test workflow (trigger manually)
router.post('/:id/test', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user!.id);

    // Create a mock booking for testing
    const mockBooking = {
      id: 'test-booking-id',
      guestName: 'Test Guest',
      guestEmail: req.user!.email,
      guestTimezone: 'UTC',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min later
      notes: 'Test booking for workflow testing',
      hostId: req.user!.id,
      eventType: {
        title: 'Test Event',
        duration: 30,
        location: 'zoom',
      },
      host: {
        name: 'Test Host',
        email: req.user!.email,
        username: req.user!.username,
        timezone: 'UTC',
      },
    };

    // Trigger the workflow with mock data
    for (const trigger of workflow.triggers) {
      await workflowService.triggerWorkflow(trigger.type, mockBooking);
    }

    res.json({ message: 'Workflow test triggered', workflow });
  } catch (error) {
    next(error);
  }
});

export default router;
