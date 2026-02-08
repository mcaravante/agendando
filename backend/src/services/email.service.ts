import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface BookingWithDetails {
  id: string;
  guestName: string;
  guestEmail: string;
  guestTimezone: string;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
  cancelReason?: string | null;
  cancellationToken: string;
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

const LOCATION_LABELS: Record<string, string> = {
  meet: 'Google Meet',
  zoom: 'Zoom',
  phone: 'Teléfono',
  'in-person': 'En persona',
};

function locationLabel(location: string): string {
  return LOCATION_LABELS[location] || location;
}

function formatDateTime(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "EEEE d 'de' MMMM, yyyy 'a las' HH:mm zzz", { locale: es });
}

export async function sendBookingConfirmation(
  booking: BookingWithDetails,
  icsContent: string,
  meetingUrl?: string
) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const cancelUrl = `${frontendUrl}/cancel/${booking.cancellationToken}`;

  const guestDateTime = formatDateTime(booking.startTime, booking.guestTimezone);
  const hostDateTime = formatDateTime(booking.startTime, booking.host.timezone);
  const loc = booking.eventType.location ? locationLabel(booking.eventType.location) : null;

  // Email to guest
  const guestHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; background: #3b82f6; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reserva Confirmada</h1>
        </div>
        <div class="content">
          <p>Hola ${booking.guestName},</p>
          <p>Tu reunión con ${booking.host.name} ha sido programada.</p>

          <div class="details">
            <h3>${booking.eventType.title}</h3>
            <p><strong>Cuándo:</strong> ${guestDateTime}</p>
            <p><strong>Duración:</strong> ${booking.eventType.duration} minutos</p>
            ${meetingUrl ? `<p><strong>Unirse a la reunión:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
            ${!meetingUrl && loc ? `<p><strong>Dónde:</strong> ${loc}</p>` : ''}
            ${booking.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
          </div>

          <p>Se adjunta una invitación de calendario a este email.</p>

          <p>¿Necesitás cancelar? <a href="${cancelUrl}" class="button">Cancelar Reserva</a></p>
        </div>
        <div class="footer">
          <p>Powered by Agendame</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email to host
  const hostHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nueva Reserva</h1>
        </div>
        <div class="content">
          <p>Hola ${booking.host.name},</p>
          <p>Tenés una nueva reserva de ${booking.guestName}.</p>

          <div class="details">
            <h3>${booking.eventType.title}</h3>
            <p><strong>Cuándo:</strong> ${hostDateTime}</p>
            <p><strong>Duración:</strong> ${booking.eventType.duration} minutos</p>
            <p><strong>Invitado:</strong> ${booking.guestName} (${booking.guestEmail})</p>
            ${meetingUrl ? `<p><strong>Unirse a la reunión:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
            ${!meetingUrl && loc ? `<p><strong>Dónde:</strong> ${loc}</p>` : ''}
            ${booking.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
          </div>

          <p>Se adjunta una invitación de calendario a este email.</p>
        </div>
        <div class="footer">
          <p>Powered by Agendame</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to guest
  await transporter.sendMail({
    from: `"Agendame" <${process.env.SMTP_USER}>`,
    to: booking.guestEmail,
    subject: `Confirmado: ${booking.eventType.title} con ${booking.host.name}`,
    html: guestHtml,
    attachments: [
      {
        filename: 'invite.ics',
        content: icsContent,
        contentType: 'text/calendar',
      },
    ],
  });

  // Send to host
  await transporter.sendMail({
    from: `"Agendame" <${process.env.SMTP_USER}>`,
    to: booking.host.email,
    subject: `Nueva reserva: ${booking.eventType.title} con ${booking.guestName}`,
    html: hostHtml,
    attachments: [
      {
        filename: 'invite.ics',
        content: icsContent,
        contentType: 'text/calendar',
      },
    ],
  });
}

export async function sendBookingCancellation(booking: BookingWithDetails) {
  const guestDateTime = formatDateTime(booking.startTime, booking.guestTimezone);
  const hostDateTime = formatDateTime(booking.startTime, booking.host.timezone);

  // Email to guest
  const guestHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reserva Cancelada</h1>
        </div>
        <div class="content">
          <p>Hola ${booking.guestName},</p>
          <p>Tu reunión con ${booking.host.name} ha sido cancelada.</p>

          <div class="details">
            <h3>${booking.eventType.title}</h3>
            <p><strong>Estaba programada para:</strong> ${guestDateTime}</p>
            ${booking.cancelReason ? `<p><strong>Motivo:</strong> ${booking.cancelReason}</p>` : ''}
          </div>
        </div>
        <div class="footer">
          <p>Powered by Agendame</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email to host
  const hostHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reserva Cancelada</h1>
        </div>
        <div class="content">
          <p>Hola ${booking.host.name},</p>
          <p>Tu reunión con ${booking.guestName} ha sido cancelada.</p>

          <div class="details">
            <h3>${booking.eventType.title}</h3>
            <p><strong>Estaba programada para:</strong> ${hostDateTime}</p>
            ${booking.cancelReason ? `<p><strong>Motivo:</strong> ${booking.cancelReason}</p>` : ''}
          </div>
        </div>
        <div class="footer">
          <p>Powered by Agendame</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to guest
  await transporter.sendMail({
    from: `"Agendame" <${process.env.SMTP_USER}>`,
    to: booking.guestEmail,
    subject: `Cancelada: ${booking.eventType.title} con ${booking.host.name}`,
    html: guestHtml,
  });

  // Send to host
  await transporter.sendMail({
    from: `"Agendame" <${process.env.SMTP_USER}>`,
    to: booking.host.email,
    subject: `Cancelada: ${booking.eventType.title} con ${booking.guestName}`,
    html: hostHtml,
  });
}
