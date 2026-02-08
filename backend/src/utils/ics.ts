import ical, { ICalCalendar, ICalEventStatus } from 'ical-generator';

interface BookingDetails {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
}

export function generateICS(booking: BookingDetails): ICalCalendar {
  const calendar = ical({ name: 'Agendame' });

  calendar.createEvent({
    id: booking.id,
    start: booking.startTime,
    end: booking.endTime,
    summary: booking.title,
    description: booking.description || `Meeting between ${booking.hostName} and ${booking.guestName}`,
    location: booking.location,
    organizer: {
      name: booking.hostName,
      email: booking.hostEmail,
    },
    attendees: [
      {
        name: booking.guestName,
        email: booking.guestEmail,
        rsvp: true,
      },
    ],
    status: ICalEventStatus.CONFIRMED,
  });

  return calendar;
}

export function generateICSString(booking: BookingDetails): string {
  return generateICS(booking).toString();
}
