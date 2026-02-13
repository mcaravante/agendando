import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLoading } from '../components/common/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';
import { PublicProfile as PublicProfileType } from '../types';

const DEFAULT_BRAND_COLOR = '#3b82f6';

export function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<PublicProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/public/${username}`);
      setProfile(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(t('public.userNotFound'));
      } else {
        setError(t('public.errorLoading'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || t('public.userNotFound')}
          </h1>
          <p className="text-gray-500 mb-6">
            {t('public.pageNotFound')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('public.goHome')}
          </Link>
        </div>
      </div>
    );
  }

  const brandColor = profile.brandColor || DEFAULT_BRAND_COLOR;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        {/* Profile header */}
        <div className="text-center mb-10">
          {profile.logoUrl ? (
            <div className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg bg-white">
              <img
                src={`/api${profile.logoUrl}`}
                alt={profile.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg"
              style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }}
            >
              {profile.avatarUrl ? (
                <img
                  src={`/api${profile.avatarUrl}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-medium text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-500 mt-1">@{profile.username}</p>
        </div>

        {/* Event types */}
        {profile.eventTypes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600">{t('public.noEvents')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-center mb-6">
              {t('public.selectEvent')}
            </h2>
            {profile.eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                to={`/${username}/${eventType.slug}`}
                className="block group"
                onMouseEnter={() => setHoveredCard(eventType.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className="bg-white rounded-xl border-2 p-5 hover:shadow-md transition-all duration-200"
                  style={{
                    borderColor: hoveredCard === eventType.id ? brandColor : '#e5e7eb',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1.5 h-14 rounded-full flex-shrink-0"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-lg transition-colors"
                        style={{ color: hoveredCard === eventType.id ? brandColor : '#111827' }}
                      >
                        {eventType.title}
                      </h3>
                      {eventType.description && (
                        <p className="text-gray-500 mt-1 line-clamp-2">
                          {eventType.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {eventType.duration} min
                        </div>
                        {eventType.location && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {eventType.location === 'zoom' && t('location.zoom')}
                            {eventType.location === 'meet' && t('location.meet')}
                            {eventType.location === 'phone' && t('location.phone')}
                            {eventType.location === 'in-person' && t('location.inPerson')}
                            {!['zoom', 'meet', 'phone', 'in-person'].includes(eventType.location || '') && eventType.location}
                          </div>
                        )}
                        {eventType.price != null && Number(eventType.price) > 0 && (
                          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: brandColor }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${Number(eventType.price).toLocaleString()} {eventType.currency || 'ARS'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 transition-colors"
                      style={{ color: hoveredCard === eventType.id ? brandColor : '#9ca3af' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            {t('public.poweredBy')}{' '}
            <Link to="/" className="font-medium" style={{ color: brandColor }}>
              Agendando
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
