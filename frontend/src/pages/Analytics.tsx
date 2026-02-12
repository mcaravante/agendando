import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Loading } from '../components/common/Loading';
import api from '../utils/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalBookings: number;
    totalCancelled: number;
    cancellationRate: number;
    avgBookingsPerWeek: number;
    mostPopularEventType: string;
  };
  bookingsOverTime: { week: string; confirmed: number; cancelled: number }[];
  bookingsByEventType: { title: string; color: string; count: number }[];
  bookingsByDayOfWeek: { day: number; dayName: string; count: number }[];
  bookingsByHour: { hour: number; count: number }[];
  topGuests: { guestEmail: string; guestName: string; count: number }[];
}

const dayNamesEs: Record<string, string> = {
  Sunday: 'Dom',
  Monday: 'Lun',
  Tuesday: 'Mar',
  Wednesday: 'Mie',
  Thursday: 'Jue',
  Friday: 'Vie',
  Saturday: 'Sab',
};

const dayNamesEn: Record<string, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

type RangePreset = '7' | '30' | '90' | 'custom';

export function Analytics() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<RangePreset>('90');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (params?: { days?: number; from?: string; to?: string }) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (params?.from && params?.to) {
        query.set('from', params.from);
        query.set('to', params.to);
      } else if (params?.days) {
        query.set('days', String(params.days));
      }
      const qs = query.toString();
      const res = await api.get(`/dashboard/analytics${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (preset: '7' | '30' | '90') => {
    setRange(preset);
    loadAnalytics({ days: Number(preset) });
  };

  const handleApplyCustom = () => {
    if (fromDate && toDate) {
      loadAnalytics({ from: fromDate, to: toDate });
    }
  };

  const getSubtitle = () => {
    if (range === 'custom' && fromDate && toDate) {
      const fmt = (d: string) => {
        const date = new Date(d + 'T00:00:00');
        return date.toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', {
          day: 'numeric', month: 'short', year: 'numeric',
        });
      };
      return `${fmt(fromDate)} - ${fmt(toDate)}`;
    }
    const key = range === '7' ? 'analytics.last7days' : range === '30' ? 'analytics.last30days' : 'analytics.last90days';
    return t(key);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (!data || data.summary.totalBookings === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('analytics.title')}
        </h1>
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('analytics.noData')}</p>
        </div>
      </div>
    );
  }

  const formatWeekLabel = (week: unknown) => {
    const s = String(week);
    const d = new Date(s + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const formatHour = (hour: unknown) => {
    const h = Number(hour);
    return `${h.toString().padStart(2, '0')}:00`;
  };

  const getDayShort = (dayName: unknown) => {
    const s = String(dayName);
    return language === 'es' ? dayNamesEs[s] || s : dayNamesEn[s] || s;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.title')}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {getSubtitle()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['7', '30', '90'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  range === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p}{language === 'es' ? 'd' : 'd'}
              </button>
            ))}
            <button
              onClick={() => setRange('custom')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                range === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('analytics.custom')}
            </button>
          </div>
        </div>
        {range === 'custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.from')}</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <label className="text-sm text-gray-600 dark:text-gray-400">{t('analytics.to')}</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleApplyCustom}
              disabled={!fromDate || !toDate}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('analytics.apply')}
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label={t('analytics.totalBookings')}
          value={data.summary.totalBookings}
          color="blue"
        />
        <KpiCard
          label={t('analytics.cancellationRate')}
          value={`${data.summary.cancellationRate}%`}
          color="red"
        />
        <KpiCard
          label={t('analytics.avgPerWeek')}
          value={data.summary.avgBookingsPerWeek}
          color="green"
        />
        <KpiCard
          label={t('analytics.mostPopular')}
          value={data.summary.mostPopularEventType}
          color="purple"
          isText
        />
      </div>

      {/* Bookings over time - full width */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('analytics.bookingsOverTime')}
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.bookingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeekLabel}
                stroke={textColor}
                fontSize={12}
              />
              <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: isDark ? '#f3f4f6' : '#111827',
                }}
                labelFormatter={formatWeekLabel}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="confirmed"
                name={t('analytics.confirmed')}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cancelled"
                name={t('analytics.cancelled')}
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: By event type + by day of week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By event type - Donut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.byEventType')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.bookingsByEventType}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="title"
                  paddingAngle={2}
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={true}
                >
                  {data.bookingsByEventType.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By day of week - Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.byDayOfWeek')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bookingsByDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="dayName"
                  tickFormatter={getDayShort}
                  stroke={textColor}
                  fontSize={12}
                />
                <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                  labelFormatter={getDayShort}
                />
                <Bar
                  dataKey="count"
                  name={t('analytics.bookings')}
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: By hour + top guests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By hour of day - Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.byHourOfDay')}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bookingsByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="hour"
                  tickFormatter={formatHour}
                  stroke={textColor}
                  fontSize={12}
                />
                <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '8px',
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                  labelFormatter={formatHour}
                />
                <Bar
                  dataKey="count"
                  name={t('analytics.bookings')}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top guests - Horizontal Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.topGuests')}
          </h2>
          <div className="h-64">
            {data.topGuests.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topGuests} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="guestName"
                    stroke={textColor}
                    fontSize={12}
                    width={120}
                    tickFormatter={(name: string) => name.length > 15 ? name.slice(0, 15) + '...' : name}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      color: isDark ? '#f3f4f6' : '#111827',
                    }}
                    formatter={(value: unknown) => [String(value), t('analytics.bookings')]}
                  />
                  <Bar
                    dataKey="count"
                    name={t('analytics.bookings')}
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {t('analytics.noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'red' | 'purple';
  isText?: boolean;
}

function KpiCard({ label, value, color, isText }: KpiCardProps) {
  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };
  const bgColors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    red: 'bg-red-50 dark:bg-red-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
  };

  const icons = {
    blue: (
      <svg className={`w-6 h-6 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    red: (
      <svg className={`w-6 h-6 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    green: (
      <svg className={`w-6 h-6 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    purple: (
      <svg className={`w-6 h-6 ${iconColors[color]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${bgColors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icons[color]}
        </div>
        <div className="min-w-0">
          <p className={`${isText ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-white truncate`}>
            {value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
