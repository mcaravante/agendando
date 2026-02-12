import { PrismaClient, TriggerType, ActionType, JobStatus, Booking } from '@prisma/client';
import { subHours } from 'date-fns';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

interface BookingWithDetails {
  id: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
  hostId: string;
  eventType: {
    title: string;
    duration: number;
    location?: string | null;
  };
  host: {
    name: string;
    email: string;
    username: string;
    timezone: string;
  };
}

// Workflow CRUD operations
export async function getWorkflows(userId: string) {
  return prisma.workflow.findMany({
    where: { userId },
    include: {
      triggers: true,
      actions: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkflowById(id: string, userId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      triggers: true,
      actions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workflow || workflow.userId !== userId) {
    throw new AppError('Workflow not found', 404);
  }

  return workflow;
}

interface CreateWorkflowInput {
  userId: string;
  name: string;
  triggers: { type: TriggerType; config?: any }[];
  actions: { type: ActionType; config: any }[];
}

export async function createWorkflow(input: CreateWorkflowInput) {
  const { userId, name, triggers, actions } = input;

  return prisma.workflow.create({
    data: {
      userId,
      name,
      triggers: {
        create: triggers.map((t) => ({
          type: t.type,
          config: t.config,
        })),
      },
      actions: {
        create: actions.map((a, index) => ({
          type: a.type,
          config: a.config,
          order: index,
        })),
      },
    },
    include: {
      triggers: true,
      actions: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

interface UpdateWorkflowInput {
  name?: string;
  isActive?: boolean;
  triggers?: { type: TriggerType; config?: any }[];
  actions?: { type: ActionType; config: any }[];
}

export async function updateWorkflow(id: string, userId: string, input: UpdateWorkflowInput) {
  const workflow = await getWorkflowById(id, userId);

  const { name, isActive, triggers, actions } = input;

  // If triggers or actions are provided, delete and recreate
  if (triggers) {
    await prisma.workflowTrigger.deleteMany({ where: { workflowId: id } });
  }
  if (actions) {
    await prisma.workflowAction.deleteMany({ where: { workflowId: id } });
  }

  return prisma.workflow.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(isActive !== undefined && { isActive }),
      ...(triggers && {
        triggers: {
          create: triggers.map((t) => ({
            type: t.type,
            config: t.config,
          })),
        },
      }),
      ...(actions && {
        actions: {
          create: actions.map((a, index) => ({
            type: a.type,
            config: a.config,
            order: index,
          })),
        },
      }),
    },
    include: {
      triggers: true,
      actions: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function deleteWorkflow(id: string, userId: string) {
  await getWorkflowById(id, userId);
  await prisma.workflow.delete({ where: { id } });
  return true;
}

// Workflow execution
export async function triggerWorkflow(
  triggerType: TriggerType,
  booking: BookingWithDetails
) {
  // Find all active workflows with matching trigger for this host
  const workflows = await prisma.workflow.findMany({
    where: {
      userId: booking.hostId,
      isActive: true,
      triggers: {
        some: { type: triggerType },
      },
    },
    include: {
      actions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  for (const workflow of workflows) {
    for (const action of workflow.actions) {
      await executeAction(action.type, action.config, booking);
    }
  }
}

async function executeAction(
  actionType: ActionType,
  config: any,
  booking: BookingWithDetails
) {
  switch (actionType) {
    case 'SEND_EMAIL':
      await executeEmailAction(config, booking);
      break;
    case 'SEND_WEBHOOK':
      await executeWebhookAction(config, booking);
      break;
  }
}

async function executeEmailAction(config: any, booking: BookingWithDetails) {
  const { to, subject, body } = config;

  // Replace placeholders in subject and body
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{{guestName}}/g, booking.guestName)
      .replace(/{{guestEmail}}/g, booking.guestEmail)
      .replace(/{{hostName}}/g, booking.host.name)
      .replace(/{{eventTitle}}/g, booking.eventType.title)
      .replace(/{{startTime}}/g, booking.startTime.toISOString())
      .replace(/{{duration}}/g, booking.eventType.duration.toString());
  };

  const finalSubject = replacePlaceholders(subject);
  const finalBody = replacePlaceholders(body);

  // Determine recipient
  let recipient: string;
  if (to === 'guest') {
    recipient = booking.guestEmail;
  } else if (to === 'host') {
    recipient = booking.host.email;
  } else {
    recipient = to; // Custom email
  }

  // Create job for sending email
  await prisma.job.create({
    data: {
      type: 'SEND_EMAIL',
      data: {
        to: recipient,
        subject: finalSubject,
        body: finalBody,
      },
      scheduledAt: new Date(),
      userId: booking.hostId,
    },
  });
}

async function executeWebhookAction(config: any, booking: BookingWithDetails) {
  const { url, method = 'POST' } = config;

  // Create job for webhook
  await prisma.job.create({
    data: {
      type: 'SEND_WEBHOOK',
      data: {
        url,
        method,
        payload: {
          event: 'booking',
          booking: {
            id: booking.id,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            startTime: booking.startTime.toISOString(),
            endTime: booking.endTime.toISOString(),
            eventTitle: booking.eventType.title,
            hostName: booking.host.name,
          },
        },
      },
      scheduledAt: new Date(),
      userId: booking.hostId,
    },
  });
}

// Reminder scheduling
export async function scheduleReminders(booking: BookingWithDetails) {
  const workflows = await prisma.workflow.findMany({
    where: {
      userId: booking.hostId,
      isActive: true,
      triggers: {
        some: {
          type: {
            in: ['BOOKING_REMINDER_1H', 'BOOKING_REMINDER_24H'],
          },
        },
      },
    },
    include: {
      triggers: true,
      actions: {
        orderBy: { order: 'asc' },
      },
    },
  });

  for (const workflow of workflows) {
    for (const trigger of workflow.triggers) {
      let scheduledAt: Date;

      if (trigger.type === 'BOOKING_REMINDER_24H') {
        scheduledAt = subHours(booking.startTime, 24);
      } else if (trigger.type === 'BOOKING_REMINDER_1H') {
        scheduledAt = subHours(booking.startTime, 1);
      } else {
        continue;
      }

      // Only schedule if in the future
      if (scheduledAt > new Date()) {
        for (const action of workflow.actions) {
          await prisma.job.create({
            data: {
              type: `REMINDER_${action.type}`,
              data: {
                bookingId: booking.id,
                actionType: action.type,
                actionConfig: action.config,
                triggerType: trigger.type,
              },
              scheduledAt,
              userId: booking.hostId,
            },
          });
        }
      }
    }
  }
}

export async function cancelReminders(bookingId: string) {
  // Cancel all pending reminder jobs for this booking
  await prisma.job.updateMany({
    where: {
      status: 'PENDING',
      type: {
        startsWith: 'REMINDER_',
      },
      data: {
        path: ['bookingId'],
        equals: bookingId,
      },
    },
    data: {
      status: 'COMPLETED',
    },
  });
}

// Job processing
export async function processJobs() {
  const jobs = await prisma.job.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: { lte: new Date() },
    },
    take: 10,
    orderBy: { scheduledAt: 'asc' },
  });

  for (const job of jobs) {
    await processJob(job.id);
  }
}

async function processJob(jobId: string) {
  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      attempts: { increment: 1 },
    },
  });

  try {
    if (job.type === 'SEND_EMAIL') {
      await processSendEmailJob(job.data as any);
    } else if (job.type === 'SEND_WEBHOOK') {
      await processSendWebhookJob(job.data as any);
    } else if (job.type.startsWith('REMINDER_')) {
      await processReminderJob(job.data as any);
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } catch (error: any) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: job.attempts >= 3 ? 'FAILED' : 'PENDING',
        error: error.message,
      },
    });
  }
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript\s*:/gi, '');
}

async function processSendEmailJob(data: { to: string; subject: string; body: string }) {
  const sanitizedSubject = data.subject.replace(/<[^>]+>/g, '');
  const sanitizedBody = sanitizeHtml(data.body);

  // Import email service dynamically to avoid circular dependencies
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 24px; background: #ffffff; }
    .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${sanitizedSubject}</h1>
    </div>
    <div class="content">
      ${sanitizedBody}
    </div>
    <div class="footer">
      <p>Powered by Agendando</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Agendando" <${process.env.SMTP_USER}>`,
    to: data.to,
    subject: sanitizedSubject,
    html,
  });
}

async function processSendWebhookJob(data: { url: string; method: string; payload: any }) {
  const response = await fetch(data.url, {
    method: data.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }
}

async function processReminderJob(data: {
  bookingId: string;
  actionType: ActionType;
  actionConfig: any;
  triggerType: TriggerType;
}) {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      eventType: true,
      host: {
        select: {
          name: true,
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
  });

  if (!booking || booking.status !== 'CONFIRMED') {
    return; // Booking was cancelled or doesn't exist
  }

  await executeAction(data.actionType, data.actionConfig, booking as BookingWithDetails);
}

// Cleanup expired PENDING_PAYMENT bookings
async function cleanupExpiredPayments() {
  try {
    const result = await prisma.booking.updateMany({
      where: {
        status: 'PENDING_PAYMENT',
        paymentExpiresAt: { lt: new Date() },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: 'Payment expired',
        paymentStatus: 'expired',
      },
    });
    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired payment bookings`);
    }
  } catch (error) {
    console.error('Payment cleanup error:', error);
  }
}

// Start job processor (call this on server start)
let jobProcessorInterval: NodeJS.Timeout | null = null;
let paymentCleanupInterval: NodeJS.Timeout | null = null;

export function startJobProcessor() {
  if (jobProcessorInterval) return;

  // Process jobs every 30 seconds
  jobProcessorInterval = setInterval(async () => {
    try {
      await processJobs();
    } catch (error) {
      console.error('Job processor error:', error);
    }
  }, 30000);

  // Cleanup expired payments every 5 minutes
  paymentCleanupInterval = setInterval(async () => {
    await cleanupExpiredPayments();
  }, 5 * 60 * 1000);

  // Process immediately on start
  processJobs().catch(console.error);
  cleanupExpiredPayments().catch(console.error);
}

export function stopJobProcessor() {
  if (jobProcessorInterval) {
    clearInterval(jobProcessorInterval);
    jobProcessorInterval = null;
  }
  if (paymentCleanupInterval) {
    clearInterval(paymentCleanupInterval);
    paymentCleanupInterval = null;
  }
}
