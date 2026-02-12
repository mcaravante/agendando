import { PrismaClient } from '@prisma/client';
import { vi, beforeAll, afterAll } from 'vitest';
import { generateToken } from '../utils/jwt';

// Mock email service
vi.mock('../services/email.service', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
  sendBookingCancellation: vi.fn().mockResolvedValue(undefined),
}));

// Mock integrations
vi.mock('../services/integrations', () => ({
  hasIntegration: vi.fn().mockResolvedValue(false),
  getUserIntegrations: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue({}),
  deleteCalendarEvent: vi.fn().mockResolvedValue(undefined),
  createZoomMeeting: vi.fn().mockResolvedValue({}),
  deleteZoomMeeting: vi.fn().mockResolvedValue(undefined),
}));

const prisma = new PrismaClient();

export let testUserId: string;
export let testEventTypeSlug: string;
export let testAuthToken: string;

beforeAll(async () => {
  // Create test user (upsert to be idempotent across test files)
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash('testuser', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@agendando.test' },
    update: {},
    create: {
      email: 'test@agendando.test',
      username: 'testuser',
      passwordHash,
      name: 'Test User',
      timezone: 'America/Argentina/Buenos_Aires',
    },
  });
  testUserId = user.id;

  // Upsert event type
  const existingEventType = await prisma.eventType.findFirst({
    where: { userId: user.id, slug: 'test-meeting' },
  });
  const eventType = existingEventType || await prisma.eventType.create({
    data: {
      userId: user.id,
      title: 'Test Meeting',
      slug: 'test-meeting',
      duration: 30,
      isActive: true,
    },
  });
  testEventTypeSlug = eventType.slug;

  // Create availability (Mon-Fri 9-17) if not exists
  const existingAvailability = await prisma.availability.findFirst({
    where: { userId: user.id },
  });
  if (!existingAvailability) {
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          userId: user.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
    }
  }

  // Upsert scheduling config
  await prisma.schedulingConfig.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      bufferBefore: 0,
      bufferAfter: 0,
      minNotice: 60,
      maxDaysInAdvance: 60,
    },
  });

  // Generate auth token
  testAuthToken = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
});

afterAll(async () => {
  // Cleanup in correct order (respecting foreign keys)
  await prisma.job.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.booking.deleteMany({ where: { hostId: testUserId } });
  await prisma.workflowAction.deleteMany({});
  await prisma.workflowTrigger.deleteMany({});
  await prisma.workflow.deleteMany({ where: { userId: testUserId } });
  await prisma.availability.deleteMany({ where: { userId: testUserId } });
  await prisma.eventType.deleteMany({ where: { userId: testUserId } });
  await prisma.schedulingConfig.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});
