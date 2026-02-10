import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLoading } from '../components/common/Loading';
import api from '../utils/api';
import { PublicProfile as PublicProfileType } from '../types';

export function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/public/${username}`);
      setProfile(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Error loading profile');
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
            {error || 'User not found'}
          </h1>
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or is unavailable.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        {/* Profile header */}
        <div className="text-center mb-10">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg">
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
            <p className="text-gray-600">No events available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-center mb-6">
              Select an event to schedule
            </h2>
            {profile.eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                to={`/${username}/${eventType.slug}`}
                className="block group"
              >
                <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-500 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1.5 h-14 rounded-full flex-shrink-0"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
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
                            {eventType.location === 'zoom' && 'Zoom'}
                            {eventType.location === 'meet' && 'Google Meet'}
                            {eventType.location === 'phone' && 'Phone call'}
                            {eventType.location === 'in-person' && 'In person'}
                            {!['zoom', 'meet', 'phone', 'in-person'].includes(eventType.location || '') && eventType.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
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
            Powered by{' '}
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Agendando
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
