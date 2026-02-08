import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailableSlot {
  time: string;
  datetime: Date;
}
