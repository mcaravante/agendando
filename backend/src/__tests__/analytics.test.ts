import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';
import { testAuthToken } from './setup';

describe('GET /api/dashboard/analytics', () => {
  it('should return analytics with auth (200)', async () => {
    const res = await request(app)
      .get('/api/dashboard/analytics')
      .set('Authorization', `Bearer ${testAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('bookingsOverTime');
    expect(res.body).toHaveProperty('bookingsByEventType');
    expect(res.body).toHaveProperty('bookingsByDayOfWeek');
    expect(res.body).toHaveProperty('bookingsByHour');
    expect(res.body).toHaveProperty('topGuests');

    expect(res.body.summary).toHaveProperty('totalBookings');
    expect(res.body.summary).toHaveProperty('cancellationRate');
    expect(res.body.summary).toHaveProperty('avgBookingsPerWeek');
    expect(res.body.summary).toHaveProperty('mostPopularEventType');
  });

  it('should accept ?days=30 parameter', async () => {
    const res = await request(app)
      .get('/api/dashboard/analytics?days=30')
      .set('Authorization', `Bearer ${testAuthToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/dashboard/analytics');

    expect(res.status).toBe(401);
  });
});
