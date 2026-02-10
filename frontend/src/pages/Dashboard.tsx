import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { BookingList } from '../components/dashboard/BookingList';
import { CreateEventTypeModal } from '../components/event-types/CreateEventTypeModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import api from '../utils/api';
import { Booking } from '../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  upcoming: number;
  thisMonth: number;
  cancelled: number;
  total: number;
  activeEventTypes: number;
  weeklyBookings: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings', { params: { filter: 'upcoming' } }),
        api.get('/dashboard/stats'),
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (id: string) => {
    setCancellingId(id);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${cancellingId}/cancel`);
      toast.success(language === 'es' ? 'Reunión cancelada' : 'Meeting cancelled');
      loadData();
    } catch (error) {
      toast.error(language === 'es' ? 'Error al cancelar' : 'Failed to cancel meeting');
    } finally {
      setIsCancelling(false);
      setCancellingId(null);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Here's what's happening with your bookings.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Upcoming"
          value={stats?.upcoming || 0}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="This Month"
          value={stats?.thisMonth || 0}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelled || 0}
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
        />
        <StatCard
          label="Total"
          value={stats?.total || 0}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
            <Link
              to="/bookings"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>

          {bookings.length > 0 ? (
            <BookingList
              bookings={bookings.slice(0, 5)}
              timezone={user?.timezone || 'America/Argentina/Buenos_Aires'}
              onCancel={handleCancel}
              emptyMessage="No upcoming meetings"
            />
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">No upcoming meetings</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Share your booking link to start receiving bookings
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          {/* Share link card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">Share your booking link</h3>
            <p className="text-sm text-blue-100 mb-4">
              Share this link with people to let them book time with you.
            </p>
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-sm truncate">
                {window.location.origin}/{user?.username}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyPublicLink}
                className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Copy Link
              </button>
              <a
                href={`/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 rounded-lg text-sm hover:bg-blue-400 transition-colors"
              >
                Preview
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionLink
                to="/event-types"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
                label="Create Event Type"
              />
              <QuickActionLink
                to="/availability"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Set Availability"
              />
              <QuickActionLink
                to="/integrations"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                }
                label="Connect Calendar"
              />
              <QuickActionLink
                to="/workflows"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
                label="Create Workflow"
              />
            </div>
          </div>

          {/* Event types count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Event Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeEventTypes || 0}</p>
              </div>
              <Link
                to="/event-types"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>

      <CreateEventTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          loadData();
        }}
      />

      <ConfirmModal
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={confirmCancel}
        title={language === 'es' ? 'Cancelar reunión' : 'Cancel meeting'}
        message={language === 'es'
          ? '¿Estás seguro de cancelar esta reunión?'
          : 'Are you sure you want to cancel this meeting?'}
        confirmLabel={language === 'es' ? 'Cancelar reunión' : 'Cancel meeting'}
        cancelLabel={language === 'es' ? 'Volver' : 'Go back'}
        isLoading={isCancelling}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const bgColors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    red: 'bg-red-50 dark:bg-red-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${bgColors[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface QuickActionLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function QuickActionLink({ to, icon, label }: QuickActionLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="text-gray-400">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
