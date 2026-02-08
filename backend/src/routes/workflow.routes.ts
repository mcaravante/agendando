import { Router, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as workflowService from '../services/workflow.service';
import { TriggerType, ActionType } from '@prisma/client';

const router = Router();

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  triggers: z.array(
    z.object({
      type: z.nativeEnum(TriggerType),
      config: z.any().optional(),
    })
  ).min(1, 'At least one trigger is required'),
  actions: z.array(
    z.object({
      type: z.nativeEnum(ActionType),
      config: z.any(),
    })
  ).min(1, 'At least one action is required'),
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
  actions: z.array(
    z.object({
      type: z.nativeEnum(ActionType),
      config: z.any(),
    })
  ).optional(),
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
