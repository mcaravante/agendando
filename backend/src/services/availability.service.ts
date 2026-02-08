import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export async function getAvailability(userId: string) {
  const availability = await prisma.availability.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  return availability;
}

export async function updateAvailability(userId: string, slots: AvailabilitySlot[]) {
  // Delete existing availability
  await prisma.availability.deleteMany({
    where: { userId },
  });

  // Create new availability
  if (slots.length > 0) {
    await prisma.availability.createMany({
      data: slots.map((slot) => ({
        userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });
  }

  return getAvailability(userId);
}

export async function getSchedulingConfig(userId: string) {
  let config = await prisma.schedulingConfig.findUnique({
    where: { userId },
  });

  if (!config) {
    config = await prisma.schedulingConfig.create({
      data: { userId },
    });
  }

  return config;
}

export async function updateSchedulingConfig(
  userId: string,
  data: {
    bufferBefore?: number;
    bufferAfter?: number;
    minNotice?: number;
    maxDaysInAdvance?: number;
  }
) {
  const config = await prisma.schedulingConfig.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return config;
}

export async function getDateOverrides(userId: string) {
  return prisma.dateOverride.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
}

export async function setDateOverrides(
  userId: string,
  date: Date,
  data: {
    isBlocked?: boolean;
    slots?: { startTime: string; endTime: string }[];
  }
) {
  // Delete existing overrides for this date
  await prisma.dateOverride.deleteMany({
    where: { userId, date },
  });

  if (data.isBlocked) {
    // Create a single blocked row
    await prisma.dateOverride.create({
      data: { userId, date, isBlocked: true },
    });
  } else if (data.slots && data.slots.length > 0) {
    // Create one row per slot
    await prisma.dateOverride.createMany({
      data: data.slots.map((slot) => ({
        userId,
        date,
        isBlocked: false,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });
  }

  return prisma.dateOverride.findMany({
    where: { userId, date },
    orderBy: { startTime: 'asc' },
  });
}

export async function deleteDateOverride(userId: string, date: Date) {
  return prisma.dateOverride.deleteMany({
    where: { userId, date },
  });
}
