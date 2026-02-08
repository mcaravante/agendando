import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import * as integrationService from '../services/integrations';
import { IntegrationProvider } from '@prisma/client';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Get all integrations for current user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const integrations = await integrationService.getUserIntegrations(req.user!.id);
    res.json(integrations);
  } catch (error) {
    next(error);
  }
});

// Google Calendar OAuth
router.get('/google/auth', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const url = integrationService.getGoogleAuthUrl(req.user!.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/integrations?error=${error}`);
    }

    if (!code || !userId) {
      return res.redirect(`${FRONTEND_URL}/integrations?error=missing_params`);
    }

    await integrationService.handleGoogleCallback(code as string, userId as string);

    res.redirect(`${FRONTEND_URL}/integrations?success=google`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${FRONTEND_URL}/integrations?error=google_failed`);
  }
});

router.delete('/google', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await integrationService.disconnectGoogle(req.user!.id);
    res.json({ message: 'Google Calendar disconnected' });
  } catch (error) {
    next(error);
  }
});

// Zoom OAuth
router.get('/zoom/auth', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const url = integrationService.getZoomAuthUrl(req.user!.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

router.get('/zoom/callback', async (req, res, next) => {
  try {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/integrations?error=${error}`);
    }

    if (!code || !userId) {
      return res.redirect(`${FRONTEND_URL}/integrations?error=missing_params`);
    }

    await integrationService.handleZoomCallback(code as string, userId as string);

    res.redirect(`${FRONTEND_URL}/integrations?success=zoom`);
  } catch (error) {
    console.error('Zoom callback error:', error);
    res.redirect(`${FRONTEND_URL}/integrations?error=zoom_failed`);
  }
});

router.delete('/zoom', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    await integrationService.disconnectZoom(req.user!.id);
    res.json({ message: 'Zoom disconnected' });
  } catch (error) {
    next(error);
  }
});

// Generic disconnect by provider
router.delete('/:provider', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const provider = req.params.provider.toUpperCase() as IntegrationProvider;

    if (provider === IntegrationProvider.GOOGLE_CALENDAR) {
      await integrationService.disconnectGoogle(req.user!.id);
    } else if (provider === IntegrationProvider.ZOOM) {
      await integrationService.disconnectZoom(req.user!.id);
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json({ message: `${provider} disconnected` });
  } catch (error) {
    next(error);
  }
});

export default router;
