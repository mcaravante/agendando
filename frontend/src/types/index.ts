export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  timezone: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface EventType {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  color: string;
  location?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface SchedulingConfig {
  id: string;
  userId: string;
  bufferBefore: number;
  bufferAfter: number;
  minNotice: number;
  maxDaysInAdvance: number;
}

export interface DateOverride {
  id: string;
  userId: string;
  date: string;
  isBlocked: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  hostId: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  status: 'CONFIRMED' | 'CANCELLED';
  cancellationToken: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  eventType?: EventType;
  host?: User;
}

export interface AvailableSlot {
  time: string;
  datetime: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  timezone: string;
  eventTypes: Pick<EventType, 'id' | 'title' | 'slug' | 'description' | 'duration' | 'color' | 'location'>[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
