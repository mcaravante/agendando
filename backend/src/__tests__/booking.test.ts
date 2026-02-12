import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server';
import { testAuthToken } from './setup';
import { addDays, nextMonday, setHours, setMinutes } from 'date-fns';

// Find next Monday at 10:00 UTC (safe time for availability 9-17 Argentina)
function getNextAvailableSlot(offsetHours = 0): string {
  const monday = nextMonday(addDays(new Date(), 1));
  const slot = setMinutes(setHours(monday, 14 + offsetHours), 0); // 14 UTC = 11 Argentina
  return slot.toISOString();
}

let createdBookingToken: string;

describe('POST /api/bookings', () => {
  it('should create a booking (201)', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        username: 'testuser',
        eventSlug: 'test-meeting',
        startTime: getNextAvailableSlot(),
        guestName: 'Guest One',
        guestEmail: 'guest1@example.com',
        guestTimezone: 'UTC',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('cancellationToken');
    expect(res.body.guestName).toBe('Guest One');
    createdBookingToken = res.body.cancellationToken;
  });

  it('should return 404 for non-existent username', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        username: 'nonexistentuser',
        eventSlug: 'test-meeting',
        startTime: getNextAvailableSlot(1),
        guestName: 'Guest Two',
        guestEmail: 'guest2@example.com',
        guestTimezone: 'UTC',
      });

    expect(res.status).toBe(404);
  });

  it('should return 409 for double-booking', async () => {
    const startTime = getNextAvailableSlot(2);

    // First booking
    await request(app)
      .post('/api/bookings')
      .send({
        username: 'testuser',
        eventSlug: 'test-meeting',
        startTime,
        guestName: 'Guest Three',
        guestEmail: 'guest3@example.com',
        guestTimezone: 'UTC',
      });

    // Same slot again
    const res = await request(app)
      .post('/api/bookings')
      .send({
        username: 'testuser',
        eventSlug: 'test-meeting',
        startTime,
        guestName: 'Guest Four',
        guestEmail: 'guest4@example.com',
        guestTimezone: 'UTC',
      });

    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        username: 'testuser',
        eventSlug: 'test-meeting',
        startTime: getNextAvailableSlot(3),
        guestName: 'Guest Five',
        guestEmail: 'not-an-email',
        guestTimezone: 'UTC',
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/bookings/cancel/:token', () => {
  it('should cancel a booking by token (200)', async () => {
    const res = await request(app)
      .post(`/api/bookings/cancel/${createdBookingToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CANCELLED');
  });

  it('should return 404 for invalid token', async () => {
    const res = await request(app)
      .post('/api/bookings/cancel/00000000-0000-0000-0000-000000000000')
      .send({});

    expect(res.status).toBe(404);
  });
});

describe('GET /api/bookings', () => {
  it('should return bookings with auth (200)', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${testAuthToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/bookings');

    expect(res.status).toBe(401);
  });
});
