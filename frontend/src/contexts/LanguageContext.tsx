import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

// All translations
export const translations: Translations = {
  // Navigation
  'nav.dashboard': { es: 'Panel', en: 'Dashboard' },
  'nav.eventTypes': { es: 'Tipos de Eventos', en: 'Event Types' },
  'nav.availability': { es: 'Disponibilidad', en: 'Availability' },
  'nav.contacts': { es: 'Contactos', en: 'Contacts' },
  'nav.bookings': { es: 'Reservas', en: 'Bookings' },
  'nav.workflows': { es: 'Notificaciones', en: 'Notifications' },
  'nav.integrations': { es: 'Integraciones', en: 'Integrations' },
  'nav.profile': { es: 'Perfil', en: 'Profile' },
  'nav.analytics': { es: 'Analitica', en: 'Analytics' },
  'nav.signOut': { es: 'Cerrar Sesion', en: 'Sign Out' },
  'nav.viewPublicPage': { es: 'Ver Pagina Publica', en: 'View Public Page' },
  'nav.profileSettings': { es: 'Configuracion de Perfil', en: 'Profile Settings' },

  // Common
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.delete': { es: 'Eliminar', en: 'Delete' },
  'common.edit': { es: 'Editar', en: 'Edit' },
  'common.create': { es: 'Crear', en: 'Create' },
  'common.close': { es: 'Cerrar', en: 'Close' },
  'common.apply': { es: 'Aplicar', en: 'Apply' },
  'common.back': { es: 'Volver', en: 'Back' },
  'common.next': { es: 'Siguiente', en: 'Next' },
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.error': { es: 'Error', en: 'Error' },
  'common.success': { es: 'Exito', en: 'Success' },
  'common.search': { es: 'Buscar', en: 'Search' },
  'common.filter': { es: 'Filtrar', en: 'Filter' },
  'common.columns': { es: 'Columnas', en: 'Columns' },
  'common.noResults': { es: 'Sin resultados', en: 'No results' },
  'common.minutes': { es: 'minutos', en: 'minutes' },
  'common.hours': { es: 'horas', en: 'hours' },
  'common.days': { es: 'dias', en: 'days' },
  'common.copyLink': { es: 'Copiar link', en: 'Copy link' },
  'common.copied': { es: 'Copiado', en: 'Copied' },
  'common.linkCopied': { es: 'Link copiado al portapapeles', en: 'Link copied to clipboard' },

  // Auth
  'auth.login': { es: 'Iniciar Sesion', en: 'Sign In' },
  'auth.register': { es: 'Registrarse', en: 'Sign Up' },
  'auth.email': { es: 'Email', en: 'Email' },
  'auth.password': { es: 'Contrasena', en: 'Password' },
  'auth.name': { es: 'Nombre', en: 'Name' },
  'auth.username': { es: 'Usuario', en: 'Username' },
  'auth.noAccount': { es: 'No tienes cuenta?', en: "Don't have an account?" },
  'auth.hasAccount': { es: 'Ya tienes cuenta?', en: 'Already have an account?' },
  'auth.loginTitle': { es: 'Inicia sesion en tu cuenta', en: 'Sign in to your account' },
  'auth.registerTitle': { es: 'Crea tu cuenta', en: 'Create your account' },

  // Dashboard
  'dashboard.title': { es: 'Panel de Control', en: 'Dashboard' },
  'dashboard.welcome': { es: 'Bienvenido', en: 'Welcome' },
  'dashboard.upcomingBookings': { es: 'Proximas Reservas', en: 'Upcoming Bookings' },
  'dashboard.todayBookings': { es: 'Reservas de Hoy', en: "Today's Bookings" },
  'dashboard.noUpcoming': { es: 'No tienes reservas proximas', en: 'No upcoming bookings' },
  'dashboard.quickLinks': { es: 'Enlaces Rapidos', en: 'Quick Links' },

  // Event Types
  'eventTypes.title': { es: 'Tipos de Eventos', en: 'Event Types' },
  'eventTypes.new': { es: 'Nuevo Evento', en: 'New Event' },
  'eventTypes.createFirst': { es: 'Crear tu primer evento', en: 'Create your first event' },
  'eventTypes.noEvents': { es: 'No tienes tipos de eventos todavia', en: "You don't have any event types yet" },
  'eventTypes.duration': { es: 'Duracion', en: 'Duration' },
  'eventTypes.description': { es: 'Descripcion', en: 'Description' },
  'eventTypes.color': { es: 'Color', en: 'Color' },
  'eventTypes.location': { es: 'Ubicacion', en: 'Location' },
  'eventTypes.activate': { es: 'Activar', en: 'Activate' },
  'eventTypes.deactivate': { es: 'Desactivar', en: 'Deactivate' },
  'eventTypes.addToWebsite': { es: 'Agregar a sitio web', en: 'Add to website' },
  'eventTypes.createTitle': { es: 'Crear Tipo de Evento', en: 'Create Event Type' },
  'eventTypes.editTitle': { es: 'Editar Tipo de Evento', en: 'Edit Event Type' },
  'eventTypes.deleted': { es: 'Evento eliminado', en: 'Event deleted' },
  'eventTypes.confirmDelete': { es: 'Estas seguro de eliminar este tipo de evento?', en: 'Are you sure you want to delete this event type?' },

  // Availability
  'availability.title': { es: 'Disponibilidad', en: 'Availability' },
  'availability.weeklyHours': { es: 'Horarios Semanales', en: 'Weekly Hours' },
  'availability.saveChanges': { es: 'Guardar Cambios', en: 'Save Changes' },
  'availability.notAvailable': { es: 'No disponible', en: 'Not available' },
  'availability.copySchedule': { es: 'Copiar horarios', en: 'Copy schedule' },
  'availability.copyTo': { es: 'Copiar horarios de', en: 'Copy schedule from' },
  'availability.to': { es: 'a', en: 'to' },
  'availability.timezone': { es: 'Zona horaria', en: 'Timezone' },
  'availability.addSlot': { es: 'Agregar horario', en: 'Add time slot' },
  'availability.removeSlot': { es: 'Eliminar', en: 'Remove' },
  'availability.saved': { es: 'Disponibilidad guardada', en: 'Availability saved' },
  'availability.config': { es: 'Configuracion Adicional', en: 'Additional Settings' },
  'availability.bufferBefore': { es: 'Buffer antes (minutos)', en: 'Buffer before (minutes)' },
  'availability.bufferAfter': { es: 'Buffer despues (minutos)', en: 'Buffer after (minutes)' },
  'availability.bufferBeforeDesc': { es: 'Tiempo libre antes de cada reunion', en: 'Free time before each meeting' },
  'availability.bufferAfterDesc': { es: 'Tiempo libre despues de cada reunion', en: 'Free time after each meeting' },
  'availability.minNotice': { es: 'Anticipacion minima (minutos)', en: 'Minimum notice (minutes)' },
  'availability.minNoticeDesc': { es: 'No permitir reservas con menos de este tiempo', en: "Don't allow bookings with less than this notice" },
  'availability.maxDays': { es: 'Dias maximo en adelanto', en: 'Max days in advance' },
  'availability.maxDaysDesc': { es: 'Hasta cuantos dias en el futuro pueden reservar', en: 'How far in advance can people book' },
  'availability.saveConfig': { es: 'Guardar Configuracion', en: 'Save Settings' },
  'availability.blocked': { es: 'Bloqueado', en: 'Blocked' },
  'availability.blockDay': { es: 'Bloquear este dia', en: 'Block this day' },
  'availability.dateOverride': { es: 'Horario personalizado', en: 'Date override' },
  'availability.overrideSaved': { es: 'Horario personalizado guardado', en: 'Date override saved' },
  'availability.overrideDeleted': { es: 'Horario personalizado eliminado', en: 'Date override deleted' },
  'availability.weeklyHoursHint': { es: 'Horario semanal', en: 'Weekly hours' },
  'availability.customHours': { es: 'Horario personalizado', en: 'Custom hours' },

  // Days of week
  'days.sunday': { es: 'Domingo', en: 'Sunday' },
  'days.monday': { es: 'Lunes', en: 'Monday' },
  'days.tuesday': { es: 'Martes', en: 'Tuesday' },
  'days.wednesday': { es: 'Miercoles', en: 'Wednesday' },
  'days.thursday': { es: 'Jueves', en: 'Thursday' },
  'days.friday': { es: 'Viernes', en: 'Friday' },
  'days.saturday': { es: 'Sabado', en: 'Saturday' },
  'days.sun': { es: 'DOM', en: 'SUN' },
  'days.mon': { es: 'LUN', en: 'MON' },
  'days.tue': { es: 'MAR', en: 'TUE' },
  'days.wed': { es: 'MIE', en: 'WED' },
  'days.thu': { es: 'JUE', en: 'THU' },
  'days.fri': { es: 'VIE', en: 'FRI' },
  'days.sat': { es: 'SAB', en: 'SAT' },

  // Contacts
  'contacts.title': { es: 'Contactos', en: 'Contacts' },
  'contacts.searchPlaceholder': { es: 'Buscar por nombre o email', en: 'Search by name or email' },
  'contacts.name': { es: 'Nombre', en: 'Name' },
  'contacts.email': { es: 'Email', en: 'Email' },
  'contacts.phone': { es: 'Telefono', en: 'Phone' },
  'contacts.lastMeeting': { es: 'Ultima reunion', en: 'Last meeting' },
  'contacts.nextMeeting': { es: 'Proxima reunion', en: 'Next meeting' },
  'contacts.company': { es: 'Empresa', en: 'Company' },
  'contacts.noContacts': { es: 'No hay contactos aun. Los contactos se crean automaticamente cuando alguien agenda una reunion contigo.', en: 'No contacts yet. Contacts are created automatically when someone books a meeting with you.' },
  'contacts.noResults': { es: 'No se encontraron contactos con los filtros aplicados', en: 'No contacts found with the applied filters' },
  'contacts.filterAll': { es: 'Todos', en: 'All' },
  'contacts.filterUpcoming': { es: 'Con reunion proxima', en: 'With upcoming meeting' },
  'contacts.filterPast': { es: 'Solo reuniones pasadas', en: 'Past meetings only' },
  'contacts.meetingStatus': { es: 'Estado de reuniones', en: 'Meeting status' },
  'contacts.count': { es: 'contacto', en: 'contact' },
  'contacts.countPlural': { es: 'contactos', en: 'contacts' },

  // Bookings
  'bookings.title': { es: 'Reservas', en: 'Bookings' },
  'bookings.upcoming': { es: 'Proximas', en: 'Upcoming' },
  'bookings.past': { es: 'Pasadas', en: 'Past' },
  'bookings.cancelled': { es: 'Canceladas', en: 'Cancelled' },
  'bookings.all': { es: 'Todas', en: 'All' },
  'bookings.noBookings': { es: 'No tienes reservas', en: 'No bookings' },
  'bookings.cancelBooking': { es: 'Cancelar reserva', en: 'Cancel booking' },
  'bookings.reschedule': { es: 'Reprogramar', en: 'Reschedule' },
  'bookings.confirmed': { es: 'Confirmada', en: 'Confirmed' },
  'bookings.with': { es: 'con', en: 'with' },

  // Booking Page (Public)
  'booking.selectDate': { es: 'Selecciona una fecha', en: 'Select a date' },
  'booking.selectTime': { es: 'Selecciona un horario', en: 'Select a time' },
  'booking.changeDate': { es: 'Cambiar fecha', en: 'Change date' },
  'booking.yourDetails': { es: 'Completa tus datos', en: 'Enter your details' },
  'booking.yourName': { es: 'Tu nombre', en: 'Your name' },
  'booking.yourEmail': { es: 'Tu email', en: 'Your email' },
  'booking.notes': { es: 'Notas adicionales', en: 'Additional notes' },
  'booking.notesPlaceholder': { es: 'Algo que debamos saber antes de la reunion?', en: 'Anything we should know before the meeting?' },
  'booking.schedule': { es: 'Programar Reunion', en: 'Schedule Meeting' },
  'booking.confirmed': { es: 'Reserva Confirmada!', en: 'Booking Confirmed!' },
  'booking.confirmedMessage': { es: 'Tu reunion ha sido programada.', en: 'Your meeting has been scheduled.' },
  'booking.confirmationEmail': { es: 'Recibiras un email de confirmacion con los detalles de la reunion.', en: "You'll receive a confirmation email with the meeting details." },
  'booking.notFound': { es: 'Evento no encontrado', en: 'Event not found' },
  'booking.notFoundMessage': { es: 'La pagina que buscas no existe o no esta disponible.', en: "The page you're looking for doesn't exist or isn't available." },
  'booking.viewAllEvents': { es: 'Ver todos los eventos de', en: 'View all events from' },
  'booking.yourTimezone': { es: 'Tu zona horaria', en: 'Your timezone' },
  'booking.noSlots': { es: 'No hay horarios disponibles para este dia', en: 'No available times for this day' },
  'booking.slotTaken': { es: 'Este horario ya no esta disponible. Por favor, elige otro.', en: 'This time slot is no longer available. Please choose another.' },

  // Embed Modal
  'embed.title': { es: 'Agregar a sitio web', en: 'Add to website' },
  'embed.howToAdd': { es: 'Como quieres agregar Agendando a tu sitio?', en: 'How do you want to add Agendando to your site?' },
  'embed.inline': { es: 'Inline embed', en: 'Inline embed' },
  'embed.inlineDesc': { es: 'Agrega el calendario directamente en tu sitio', en: 'Add the calendar directly to your site' },
  'embed.popupWidget': { es: 'Popup widget', en: 'Popup widget' },
  'embed.popupWidgetDesc': { es: 'Agrega un boton flotante que abre un popup', en: 'Add a floating button that opens a popup' },
  'embed.popupText': { es: 'Popup text', en: 'Popup text' },
  'embed.popupTextDesc': { es: 'Agrega un link de texto que abre un popup', en: 'Add a text link that opens a popup' },
  'embed.backToOptions': { es: 'Volver a opciones', en: 'Back to options' },
  'embed.copyInstructions': { es: 'Copia este codigo y pegalo en el HTML de tu sitio web donde quieres que aparezca el widget.', en: 'Copy this code and paste it into your website HTML where you want the widget to appear.' },
  'embed.advancedUsage': { es: 'Uso avanzado (JavaScript)', en: 'Advanced usage (JavaScript)' },
  'embed.advancedDesc': { es: 'Tambien puedes controlar el widget programaticamente:', en: 'You can also control the widget programmatically:' },
  'embed.viewPublicPage': { es: 'Ver pagina publica', en: 'View public page' },
  'embed.codeCopied': { es: 'Codigo copiado al portapapeles', en: 'Code copied to clipboard' },

  // Profile
  'profile.title': { es: 'Perfil', en: 'Profile' },
  'profile.personalInfo': { es: 'Informacion Personal', en: 'Personal Information' },
  'profile.changeAvatar': { es: 'Cambiar avatar', en: 'Change avatar' },
  'profile.timezone': { es: 'Zona Horaria', en: 'Timezone' },
  'profile.saved': { es: 'Perfil actualizado', en: 'Profile updated' },
  'profile.branding': { es: 'Branding', en: 'Branding' },
  'profile.brandColor': { es: 'Color primario', en: 'Primary color' },
  'profile.logo': { es: 'Logo', en: 'Logo' },
  'profile.logoUpload': { es: 'Subir logo', en: 'Upload logo' },
  'profile.logoRemove': { es: 'Eliminar logo', en: 'Remove logo' },
  'profile.brandingSaved': { es: 'Branding actualizado', en: 'Branding updated' },

  // Workflows
  'workflows.title': { es: 'Workflows', en: 'Workflows' },
  'workflows.new': { es: 'Nuevo Workflow', en: 'New Workflow' },
  'workflows.noWorkflows': { es: 'No tienes workflows todavia', en: "You don't have any workflows yet" },
  'workflows.createFirst': { es: 'Crear tu primer workflow', en: 'Create your first workflow' },

  // Delivery Log
  'workflows.deliveryLog': { es: 'Registro de Entregas', en: 'Delivery Log' },
  'workflows.deliveryLog.empty': { es: 'No hay registros de entrega', en: 'No delivery logs yet' },
  'workflows.deliveryLog.type': { es: 'Tipo', en: 'Type' },
  'workflows.deliveryLog.destination': { es: 'Destino', en: 'Destination' },
  'workflows.deliveryLog.status': { es: 'Estado', en: 'Status' },
  'workflows.deliveryLog.attempts': { es: 'Intentos', en: 'Attempts' },
  'workflows.deliveryLog.date': { es: 'Fecha', en: 'Date' },
  'workflows.deliveryLog.error': { es: 'Error', en: 'Error' },
  'workflows.deliveryLog.statusPending': { es: 'Pendiente', en: 'Pending' },
  'workflows.deliveryLog.statusProcessing': { es: 'Procesando', en: 'Processing' },
  'workflows.deliveryLog.statusCompleted': { es: 'Completado', en: 'Completed' },
  'workflows.deliveryLog.statusFailed': { es: 'Fallido', en: 'Failed' },
  'workflows.deliveryLog.typeEmail': { es: 'Email', en: 'Email' },
  'workflows.deliveryLog.typeWebhook': { es: 'Webhook', en: 'Webhook' },
  'workflows.deliveryLog.filterAll': { es: 'Todos', en: 'All' },
  'workflows.deliveryLog.filterEmails': { es: 'Emails', en: 'Emails' },
  'workflows.deliveryLog.filterWebhooks': { es: 'Webhooks', en: 'Webhooks' },

  // Integrations
  'integrations.title': { es: 'Integraciones', en: 'Integrations' },
  'integrations.connect': { es: 'Conectar', en: 'Connect' },
  'integrations.disconnect': { es: 'Desconectar', en: 'Disconnect' },
  'integrations.connected': { es: 'Conectado', en: 'Connected' },

  // Analytics
  'analytics.title': { es: 'Analitica', en: 'Analytics' },
  'analytics.subtitle': { es: 'Ultimos 90 dias', en: 'Last 90 days' },
  'analytics.totalBookings': { es: 'Total de reservas', en: 'Total bookings' },
  'analytics.cancellationRate': { es: 'Tasa de cancelacion', en: 'Cancellation rate' },
  'analytics.avgPerWeek': { es: 'Promedio por semana', en: 'Avg per week' },
  'analytics.mostPopular': { es: 'Mas popular', en: 'Most popular' },
  'analytics.bookingsOverTime': { es: 'Reservas en el Tiempo', en: 'Bookings Over Time' },
  'analytics.byEventType': { es: 'Por Tipo de Evento', en: 'By Event Type' },
  'analytics.byDayOfWeek': { es: 'Por Dia de la Semana', en: 'By Day of the Week' },
  'analytics.byHourOfDay': { es: 'Por Hora del Dia', en: 'By Hour of Day' },
  'analytics.topGuests': { es: 'Contactos Frecuentes', en: 'Top Guests' },
  'analytics.confirmed': { es: 'Confirmadas', en: 'Confirmed' },
  'analytics.cancelled': { es: 'Canceladas', en: 'Cancelled' },
  'analytics.noData': { es: 'No hay datos para mostrar', en: 'No data to display' },
  'analytics.bookings': { es: 'reservas', en: 'bookings' },
  'analytics.last7days': { es: 'Ultimos 7 dias', en: 'Last 7 days' },
  'analytics.last30days': { es: 'Ultimos 30 dias', en: 'Last 30 days' },
  'analytics.last90days': { es: 'Ultimos 90 dias', en: 'Last 90 days' },
  'analytics.custom': { es: 'Personalizado', en: 'Custom' },
  'analytics.from': { es: 'Desde', en: 'From' },
  'analytics.to': { es: 'Hasta', en: 'To' },
  'analytics.apply': { es: 'Aplicar', en: 'Apply' },

  // Theme
  'theme.light': { es: 'Claro', en: 'Light' },
  'theme.dark': { es: 'Oscuro', en: 'Dark' },
  'theme.system': { es: 'Sistema', en: 'System' },

  // Waitlist
  'waitlist.title': { es: 'Lista de espera', en: 'Waiting list' },
  'waitlist.description': { es: 'Dejanos tus datos y te avisamos si se liberan turnos.', en: 'Leave your details and we\'ll notify you if spots open up.' },
  'waitlist.joinButton': { es: 'Avisarme si vuelve a haber disponibilidad', en: 'Notify me if availability opens up' },
  'waitlist.success': { es: 'Te avisaremos si se liberan turnos.', en: 'We\'ll notify you if spots open up.' },
  'waitlist.error': { es: 'No se pudo unir a la lista de espera', en: 'Could not join the waiting list' },
  'waitlist.yourName': { es: 'Tu nombre', en: 'Your name' },
  'waitlist.yourEmail': { es: 'Tu email', en: 'Your email' },

  // Payments
  'payment.payAndBook': { es: 'Pagar y Reservar', en: 'Pay and Book' },
  'payment.free': { es: 'Gratuito', en: 'Free' },
  'payment.price': { es: 'Precio', en: 'Price' },
  'payment.confirmed': { es: 'Pago confirmado', en: 'Payment confirmed' },
  'payment.failed': { es: 'Pago fallido', en: 'Payment failed' },
  'payment.failedMessage': { es: 'El pago no se pudo completar. Por favor, intenta nuevamente.', en: 'The payment could not be completed. Please try again.' },
  'payment.pending': { es: 'Pago pendiente', en: 'Payment pending' },
  'payment.pendingMessage': { es: 'Tu pago esta siendo procesado. Recibiras un email de confirmacion cuando se complete.', en: 'Your payment is being processed. You will receive a confirmation email when it is completed.' },
  'payment.retry': { es: 'Intentar nuevamente', en: 'Try again' },
  'payment.processingMessage': { es: 'Tu pago esta siendo procesado. Te notificaremos cuando se confirme.', en: 'Your payment is being processed. We\'ll notify you when it\'s confirmed.' },
  'payment.priceHelp': { es: 'Dejar vacio para eventos gratuitos', en: 'Leave empty for free events' },
  'payment.expired': { es: 'El pago expiro. El turno fue liberado.', en: 'Payment expired. The slot has been released.' },

  // Integration names
  'integrations.mpName': { es: 'MercadoPago', en: 'MercadoPago' },
  'integrations.mpDescription': { es: 'Cobra por tus eventos usando MercadoPago Checkout Pro.', en: 'Accept payments for your events using MercadoPago Checkout Pro.' },

  // Public Profile
  'public.userNotFound': { es: 'Usuario no encontrado', en: 'User not found' },
  'public.errorLoading': { es: 'Error al cargar perfil', en: 'Error loading profile' },
  'public.pageNotFound': { es: 'La pagina que buscas no existe o no esta disponible.', en: "The page you're looking for doesn't exist or is unavailable." },
  'public.goHome': { es: 'Ir al inicio', en: 'Go to homepage' },
  'public.noEvents': { es: 'No hay eventos disponibles por el momento.', en: 'No events available at the moment.' },
  'public.selectEvent': { es: 'Selecciona un evento para agendar', en: 'Select an event to schedule' },
  'public.poweredBy': { es: 'Creado con', en: 'Powered by' },

  // Location labels
  'location.zoom': { es: 'Zoom', en: 'Zoom' },
  'location.meet': { es: 'Google Meet', en: 'Google Meet' },
  'location.phone': { es: 'Llamada telefonica', en: 'Phone call' },
  'location.inPerson': { es: 'En persona', en: 'In person' },

  // Errors & Toasts
  'toast.error': { es: 'Error', en: 'Error' },
  'toast.success': { es: 'Exito', en: 'Success' },
  'toast.loadError': { es: 'Error al cargar', en: 'Error loading' },
  'toast.saveError': { es: 'Error al guardar', en: 'Error saving' },
  'toast.deleteError': { es: 'Error al eliminar', en: 'Error deleting' },

  // Dashboard (additional)
  'dashboard.welcomeBack': { es: 'Hola de nuevo,', en: 'Welcome back,' },
  'dashboard.subtitle': { es: 'Esto es lo que pasa con tus reservas.', en: "Here's what's happening with your bookings." },
  'dashboard.upcomingMeetings': { es: 'Proximas Reuniones', en: 'Upcoming Meetings' },
  'dashboard.viewAll': { es: 'Ver todas', en: 'View all' },
  'dashboard.noUpcomingMeetings': { es: 'No hay reuniones proximas', en: 'No upcoming meetings' },
  'dashboard.shareLink': { es: 'Comparte tu link de reservas', en: 'Share your booking link' },
  'dashboard.shareDescription': { es: 'Comparte este link para que puedan reservar contigo.', en: 'Share this link with people to let them book time with you.' },
  'dashboard.preview': { es: 'Vista previa', en: 'Preview' },
  'dashboard.quickActions': { es: 'Acciones Rapidas', en: 'Quick Actions' },
  'dashboard.createEventType': { es: 'Crear Tipo de Evento', en: 'Create Event Type' },
  'dashboard.setAvailability': { es: 'Configurar Disponibilidad', en: 'Set Availability' },
  'dashboard.connectCalendar': { es: 'Conectar Calendario', en: 'Connect Calendar' },
  'dashboard.createWorkflow': { es: 'Crear Workflow', en: 'Create Workflow' },
  'dashboard.activeEventTypes': { es: 'Tipos de Eventos Activos', en: 'Active Event Types' },
  'dashboard.manage': { es: 'Administrar', en: 'Manage' },
  'dashboard.meetingCancelled': { es: 'Reunion cancelada', en: 'Meeting cancelled' },
  'dashboard.cancelError': { es: 'Error al cancelar', en: 'Failed to cancel meeting' },
  'dashboard.cancelMeeting': { es: 'Cancelar reunion', en: 'Cancel meeting' },
  'dashboard.cancelConfirm': { es: 'Estas seguro de cancelar esta reunion?', en: 'Are you sure you want to cancel this meeting?' },
  'dashboard.thisMonth': { es: 'Este Mes', en: 'This Month' },
  'dashboard.cancelled': { es: 'Canceladas', en: 'Cancelled' },
  'dashboard.total': { es: 'Total', en: 'Total' },
  'dashboard.createEvent': { es: 'Crear Evento', en: 'Create Event' },
  'dashboard.shareBookingTip': { es: 'Comparte tu link de reservas para empezar a recibir reservas', en: 'Share your booking link to start receiving bookings' },

  // Event Types (additional)
  'eventTypes.loadError': { es: 'Error al cargar los eventos', en: 'Error loading events' },
  'eventTypes.updateError': { es: 'Error al actualizar', en: 'Error updating' },
  'eventTypes.modal.titleLabel': { es: 'Titulo', en: 'Title' },
  'eventTypes.modal.titlePlaceholder': { es: 'Reunion de 30 minutos', en: '30 minute meeting' },
  'eventTypes.modal.slug': { es: 'Slug (URL)', en: 'Slug (URL)' },
  'eventTypes.modal.slugPlaceholder': { es: 'reunion-30-min', en: '30-min-meeting' },
  'eventTypes.modal.descriptionLabel': { es: 'Descripcion (opcional)', en: 'Description (optional)' },
  'eventTypes.modal.descriptionPlaceholder': { es: 'Una breve descripcion de la reunion', en: 'A brief meeting description' },
  'eventTypes.modal.durationLabel': { es: 'Duracion (minutos)', en: 'Duration (minutes)' },
  'eventTypes.modal.colorLabel': { es: 'Color', en: 'Color' },
  'eventTypes.modal.locationLabel': { es: 'Ubicacion (opcional)', en: 'Location (optional)' },
  'eventTypes.modal.noLocation': { es: 'Sin ubicacion', en: 'No location' },
  'eventTypes.modal.priceLabel': { es: 'Precio (opcional)', en: 'Price (optional)' },
  'eventTypes.modal.pricePlaceholder': { es: 'Gratuito', en: 'Free' },
  'eventTypes.modal.priceHelp': { es: 'Dejar vacio para eventos gratuitos. Requiere MercadoPago conectado.', en: 'Leave empty for free events. Requires MercadoPago connected.' },
  'eventTypes.modal.created': { es: 'Evento creado', en: 'Event created' },
  'eventTypes.modal.updated': { es: 'Evento actualizado', en: 'Event updated' },
  'eventTypes.modal.titleRequired': { es: 'El titulo es requerido', en: 'Title is required' },
  'eventTypes.modal.slugRequired': { es: 'El slug es requerido', en: 'Slug is required' },
  'eventTypes.modal.slugFormat': { es: 'Solo letras minusculas, numeros y guiones', en: 'Only lowercase letters, numbers and hyphens' },
  'eventTypes.modal.durationMin': { es: 'Minimo 5 minutos', en: 'Minimum 5 minutes' },
  'eventTypes.modal.durationMax': { es: 'Maximo 8 horas', en: 'Maximum 8 hours' },

  // Availability (additional)
  'availability.loadError': { es: 'Error al cargar disponibilidad', en: 'Error loading availability' },
  'availability.listView': { es: 'Vista lista', en: 'List view' },
  'availability.calendarView': { es: 'Vista calendario', en: 'Calendar view' },
  'availability.copyToOtherDays': { es: 'Copiar a otros dias', en: 'Copy to other days' },
  'availability.configSaved': { es: 'Configuracion guardada', en: 'Configuration saved' },
  'availability.timeValidation': { es: 'La hora de inicio debe ser anterior a la hora de fin', en: 'Start time must be before end time' },

  // Bookings (additional)
  'bookings.confirmCancelMessage': { es: 'Estas seguro de que deseas cancelar esta reunion?', en: 'Are you sure you want to cancel this meeting?' },
  'bookings.cancelConfirm': { es: 'Si, cancelar', en: 'Yes, cancel' },
  'bookings.cancelGoBack': { es: 'No, volver', en: 'No, go back' },
  'bookings.listView': { es: 'Vista lista', en: 'List view' },
  'bookings.calendarView': { es: 'Vista calendario', en: 'Calendar view' },
  'bookings.loadError': { es: 'Error al cargar las reuniones', en: 'Error loading meetings' },
  'bookings.meetingCancelled': { es: 'Reunion cancelada', en: 'Meeting cancelled' },
  'bookings.cancelError': { es: 'Error al cancelar la reunion', en: 'Error cancelling meeting' },
  'bookings.noUpcoming': { es: 'No hay reuniones proximas', en: 'No upcoming meetings' },
  'bookings.noPast': { es: 'No hay reuniones pasadas', en: 'No past meetings' },
  'bookings.noCancelled': { es: 'No hay reuniones canceladas', en: 'No cancelled meetings' },
  'bookings.noMeetings': { es: 'No hay reuniones', en: 'No meetings' },
  'bookings.cancelledLabel': { es: '(Cancelada)', en: '(Cancelled)' },
  'bookings.notesLabel': { es: 'Notas:', en: 'Notes:' },
  'bookings.today': { es: 'Hoy', en: 'Today' },

  // Booking (additional)
  'booking.noAvailabilityDay': { es: 'No hay disponibilidad para este dia', en: 'No availability for this day' },
  'booking.createError': { es: 'Error al crear la reserva', en: 'Error creating booking' },
  'booking.loadSlotsError': { es: 'Error al cargar horarios', en: 'Error loading time slots' },
  'booking.loadingSlots': { es: 'Cargando horarios...', en: 'Loading time slots...' },
  'booking.timesInTimezone': { es: 'Horarios en tu zona:', en: 'Times in your timezone:' },
  'booking.eventLoadError': { es: 'Error al cargar el evento', en: 'Error loading event' },
  'booking.nameRequired': { es: 'El nombre es requerido', en: 'Name is required' },
  'booking.invalidEmail': { es: 'Email invalido', en: 'Invalid email' },
  'booking.confirmBooking': { es: 'Confirmar Reserva', en: 'Confirm Booking' },
  'booking.payAndBook': { es: 'Pagar y Reservar', en: 'Pay and Book' },

  // Profile (additional)
  'profile.preferences': { es: 'Preferencias', en: 'Preferences' },
  'profile.language': { es: 'Idioma', en: 'Language' },
  'profile.theme': { es: 'Tema', en: 'Theme' },
  'profile.imageOnly': { es: 'Solo se permiten imagenes', en: 'Only images allowed' },
  'profile.imageSizeLimit': { es: 'La imagen no puede superar 5MB', en: 'Image must be under 5MB' },
  'profile.avatarUpdated': { es: 'Avatar actualizado', en: 'Avatar updated' },
  'profile.signedOut': { es: 'Sesion cerrada', en: 'Signed out' },
  'profile.nameRequired': { es: 'El nombre es requerido', en: 'Name is required' },
  'profile.timezoneRequired': { es: 'La zona horaria es requerida', en: 'Timezone is required' },

  // Integrations (additional)
  'integrations.subtitle': { es: 'Conecta tus aplicaciones favoritas para mejorar tu experiencia de programacion.', en: 'Connect your favorite apps to enhance your scheduling experience.' },
  'integrations.howItWorks': { es: 'Como funcionan las integraciones', en: 'How integrations work' },
  'integrations.googleDescription': { es: 'Sincroniza tus reservas con Google Calendar y agrega enlaces de Google Meet automaticamente.', en: 'Sync your bookings with Google Calendar and add Google Meet links automatically.' },
  'integrations.zoomDescription': { es: 'Crea reuniones de Zoom automaticamente cuando se hacen reservas.', en: 'Create Zoom meetings automatically when bookings are made.' },
  'integrations.connectedAs': { es: 'Conectado como:', en: 'Connected as:' },
  'integrations.connecting': { es: 'Conectando...', en: 'Connecting...' },
  'integrations.disconnectTitle': { es: 'Desconectar integracion', en: 'Disconnect integration' },
  'integrations.disconnectMessage': { es: 'Estas seguro de desconectar esta integracion? Tus reservas futuras no se sincronizaran.', en: 'Are you sure you want to disconnect this integration? Your future bookings will not be synced.' },
  'integrations.connectedSuccess': { es: 'conectado exitosamente!', en: 'connected successfully!' },
  'integrations.disconnectedSuccess': { es: 'Integracion desconectada', en: 'Integration disconnected' },
  'integrations.loadError': { es: 'Error al cargar integraciones', en: 'Failed to load integrations' },
  'integrations.connectError': { es: 'Error al conectar', en: 'Failed to connect' },
  'integrations.disconnectError': { es: 'Error al desconectar', en: 'Failed to disconnect' },
  'integrations.googleInfo': { es: 'Crea eventos de calendario automaticamente cuando alguien reserva contigo. Si estableces la ubicacion del tipo de evento como "Google Meet", se creara un enlace de reunion automaticamente.', en: 'Automatically creates calendar events when someone books with you. If you set an event type location to "Google Meet", a meeting link will be created automatically.' },
  'integrations.zoomInfo': { es: 'Crea reuniones de Zoom automaticamente cuando se hacen reservas para tipos de eventos con "Zoom" como ubicacion. El enlace de la reunion se incluye en los emails de confirmacion.', en: 'Creates Zoom meetings automatically when bookings are made for event types with "Zoom" as the location. The meeting link is included in confirmation emails.' },
  'integrations.mpInfo': { es: 'Cobra por tus eventos con MercadoPago. Configura un precio en tus tipos de eventos y los invitados pagan antes de confirmar la reserva. El turno se bloquea durante el pago y se libera si no se completa en 60 minutos.', en: 'Accept payments for your events with MercadoPago. Set a price on your event types and guests pay before confirming the booking. The slot is held during payment and released if not completed within 60 minutes.' },

  // Embed (additional)
  'embed.scheduleEvent': { es: 'Agendar', en: 'Schedule' },
  'embed.scheduleAMeeting': { es: 'Agendar una reunion', en: 'Schedule a meeting' },

  // Day abbreviations (short - for MonthCalendar)
  'days.sunShort': { es: 'Dom', en: 'Sun' },
  'days.monShort': { es: 'Lun', en: 'Mon' },
  'days.tueShort': { es: 'Mar', en: 'Tue' },
  'days.wedShort': { es: 'Mie', en: 'Wed' },
  'days.thuShort': { es: 'Jue', en: 'Thu' },
  'days.friShort': { es: 'Vie', en: 'Fri' },
  'days.satShort': { es: 'Sab', en: 'Sat' },

  // Day abbreviations (mini - for BookingsCalendar picker)
  'days.sunMini': { es: 'Do', en: 'Su' },
  'days.monMini': { es: 'Lu', en: 'Mo' },
  'days.tueMini': { es: 'Ma', en: 'Tu' },
  'days.wedMini': { es: 'Mi', en: 'We' },
  'days.thuMini': { es: 'Ju', en: 'Th' },
  'days.friMini': { es: 'Vi', en: 'Fr' },
  'days.satMini': { es: 'Sa', en: 'Sa' },

  'common.copy': { es: 'Copiar', en: 'Copy' },
  'eventTypes.deleteTitle': { es: 'Eliminar tipo de evento', en: 'Delete event type' },
  'eventTypes.confirmDeleteMessage': { es: 'Estas seguro de eliminar este tipo de evento? Esta accion no se puede deshacer.', en: 'Are you sure you want to delete this event type? This action cannot be undone.' },
  'eventTypes.modal.saveChanges': { es: 'Guardar Cambios', en: 'Save Changes' },
  'eventTypes.modal.createEvent': { es: 'Crear Evento', en: 'Create Event' },
  'bookings.cancelledStatus': { es: 'Cancelada', en: 'Cancelled' },
  'bookings.cancelMeetingTitle': { es: 'Cancelar reunion', en: 'Cancel meeting' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'es' || saved === 'en') return saved;
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('es') ? 'es' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
