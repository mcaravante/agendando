import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';
import * as mpService from '../services/mercadopago.service';
import * as bookingService from '../services/booking.service';

const router = Router();
const prisma = new PrismaClient();

function verifyWebhookSignature(req: Request): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('MP_WEBHOOK_SECRET not configured — skipping signature verification');
    return true;
  }

  const xSignature = req.headers['x-signature'] as string | undefined;
  const xRequestId = req.headers['x-request-id'] as string | undefined;
  if (!xSignature || !xRequestId) return false;

  // Parse ts and v1 from x-signature header
  const parts = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=').map(s => s.trim());
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // data.id comes from query params
  const dataId = req.query['data.id'] as string | undefined;

  // Build the manifest template
  let manifest = '';
  if (dataId) manifest += `id:${dataId};`;
  manifest += `request-id:${xRequestId};ts:${ts};`;

  const hmac = createHmac('sha256', secret).update(manifest).digest('hex');
  return hmac === v1;
}

// MercadoPago webhook — no auth middleware (server-to-server)
router.post('/mercadopago', async (req, res) => {
  // Validate signature before processing
  if (!verifyWebhookSignature(req)) {
    res.status(401).send('Invalid signature');
    return;
  }

  // Respond 200 immediately
  res.status(200).send('OK');

  try {
    const { type, data } = req.body;

    if (type !== 'payment' || !data?.id) {
      return;
    }

    const paymentId = String(data.id);

    // Find the booking by looking up which host's access token to use
    // We need to find the booking via the payment, so we first need to find
    // which host this payment belongs to. We'll look at all PENDING_PAYMENT bookings.
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        paymentProvider: 'mercadopago',
      },
      include: {
        host: { select: { id: true } },
      },
    });

    if (pendingBookings.length === 0) {
      console.log('No pending payment bookings found for webhook');
      return;
    }

    // Try each unique host's access token to fetch payment info
    const hostIds = [...new Set(pendingBookings.map(b => b.host.id))];

    for (const hostId of hostIds) {
      try {
        const accessToken = await mpService.getMpAccessToken(hostId);
        const paymentInfo = await mpService.getPaymentInfo(paymentId, accessToken);

        const bookingId = paymentInfo.external_reference;
        if (!bookingId) continue;

        if (paymentInfo.status === 'approved') {
          // Validate payment amount matches booking
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { paymentAmount: true },
          });
          if (booking && booking.paymentAmount !== null) {
            const expected = Number(booking.paymentAmount);
            const received = Number(paymentInfo.transaction_amount);
            if (expected !== received) {
              console.error(
                `Payment amount mismatch for booking ${bookingId}: expected ${expected}, received ${received}`
              );
              return;
            }
          }

          await bookingService.confirmBookingAfterPayment(bookingId, paymentId);
          console.log(`Payment approved for booking ${bookingId}`);
        } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              cancelReason: `Payment ${paymentInfo.status}`,
              paymentStatus: paymentInfo.status,
              paymentId: paymentId,
            },
          });
          console.log(`Payment ${paymentInfo.status} for booking ${bookingId}`);
        }

        return; // Successfully processed
      } catch (error) {
        // This host's token didn't work, try next
        continue;
      }
    }

    console.log(`Could not process payment webhook for payment ${paymentId}`);
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

export default router;
