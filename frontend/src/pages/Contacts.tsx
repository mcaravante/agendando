import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, Columns, MoreVertical, ChevronDown } from 'lucide-react';
import { Loading } from '../components/common/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  lastMeetingDate: string | null;
  nextMeetingDate: string | null;
  company: string | null;
  totalMeetings: number;
}

type ColumnKey = 'name' | 'email' | 'phoneNumber' | 'lastMeetingDate' | 'nextMeetingDate' | 'company';

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString: string | null, language: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'es' ? 'es-AR' : 'en-US', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export function Contacts() {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    'name',
    'email',
    'phoneNumber',
    'lastMeetingDate',
    'nextMeetingDate',
    'company',
  ]);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterMeetings, setFilterMeetings] = useState<'all' | 'upcoming' | 'past'>('all');

  const columnsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const ALL_COLUMNS: { key: ColumnKey; labelKey: string }[] = [
    { key: 'name', labelKey: 'contacts.name' },
    { key: 'email', labelKey: 'contacts.email' },
    { key: 'phoneNumber', labelKey: 'contacts.phone' },
    { key: 'lastMeetingDate', labelKey: 'contacts.lastMeeting' },
    { key: 'nextMeetingDate', labelKey: 'contacts.nextMeeting' },
    { key: 'company', labelKey: 'contacts.company' },
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setColumnsDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (error) {
      toast.error(t('toast.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((c) => c !== columnKey)
        : [...prev, columnKey]
    );
  };

  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query)
      );
    }

    // Filter by meeting status
    if (filterMeetings === 'upcoming') {
      result = result.filter((contact) => contact.nextMeetingDate);
    } else if (filterMeetings === 'past') {
      result = result.filter((contact) => contact.lastMeetingDate && !contact.nextMeetingDate);
    }

    return result;
  }, [contacts, searchQuery, filterMeetings]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contacts.title')}</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('contacts.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filter dropdown */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
              <ChevronDown className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 uppercase">{t('contacts.meetingStatus')}</p>
                  {[
                    { value: 'all', labelKey: 'contacts.filterAll' },
                    { value: 'upcoming', labelKey: 'contacts.filterUpcoming' },
                    { value: 'past', labelKey: 'contacts.filterPast' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterMeetings(option.value as typeof filterMeetings);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        filterMeetings === option.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columns dropdown */}
          <div ref={columnsRef} className="relative">
            <button
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Columns className="w-4 h-4" />
              {t('common.columns')}
              <ChevronDown className={`w-4 h-4 transition-transform ${columnsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {columnsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {ALL_COLUMNS.map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.key)}
                        onChange={() => toggleColumn(column.key)}
                        className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t(column.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {visibleColumns.includes('name') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.name')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.includes('email') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.email')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.includes('phoneNumber') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.phone')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.includes('lastMeetingDate') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.lastMeeting')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.includes('nextMeetingDate') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.nextMeeting')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.includes('company') && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {t('contacts.company')}
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                )}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchQuery || filterMeetings !== 'all'
                      ? t('contacts.noResults')
                      : t('contacts.noContacts')}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {visibleColumns.includes('name') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {getInitials(contact.name)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{contact.name}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('email') && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{contact.email}</td>
                    )}
                    {visibleColumns.includes('phoneNumber') && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {contact.phoneNumber || '-'}
                      </td>
                    )}
                    {visibleColumns.includes('lastMeetingDate') && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(contact.lastMeetingDate, language)}
                      </td>
                    )}
                    {visibleColumns.includes('nextMeetingDate') && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(contact.nextMeetingDate, language)}
                      </td>
                    )}
                    {visibleColumns.includes('company') && (
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {contact.company || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredContacts.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            {filteredContacts.length} {filteredContacts.length !== 1 ? t('contacts.countPlural') : t('contacts.count')}
          </div>
        )}
      </div>
    </div>
  );
}
