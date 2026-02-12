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

  // Errors & Toasts
  'toast.error': { es: 'Error', en: 'Error' },
  'toast.success': { es: 'Exito', en: 'Success' },
  'toast.loadError': { es: 'Error al cargar', en: 'Error loading' },
  'toast.saveError': { es: 'Error al guardar', en: 'Error saving' },
  'toast.deleteError': { es: 'Error al eliminar', en: 'Error deleting' },
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
