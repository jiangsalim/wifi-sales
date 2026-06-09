import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function AgentHistory() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEntries = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, per_page: 15 };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const data = await api.get('/entries', { params });
      setEntries(data.data.entries);
      setTotalPages(data.data.total_pages);
      setPage(data.data.page);
    } catch (err) {
      console.error('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleFilter = () => {
    setPage(1);
    fetchEntries(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-4 pb-20 container-site">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('history')}</h2>

        <div className="flex gap-2 mb-4">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleFilter}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
            Filter
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-1">{t('no_entries')}</p>
            <p className="text-sm">{t('no_entries_message')}</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-lg shadow-sm border p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-800 text-sm">{entry.shift_name}</span>
                    <span className="text-xs text-gray-500">{entry.entry_date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">{t('gross')}</span>
                      <p className="font-medium text-gray-800">UGX {entry.total_sales?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('expenses')}</span>
                      <p className="font-medium text-red-600">UGX {entry.expenses?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('net')}</span>
                      <p className="font-medium text-green-600">UGX {entry.net?.toLocaleString()}</p>
                    </div>
                  </div>
                  {entry.missed_shift_ids && (
                    <p className="text-xs text-orange-600 mt-1">⚡ {t('combined')}</p>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => fetchEntries(page - 1)} disabled={page <= 1}
                  className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50">Previous</button>
                <span className="px-3 py-1 text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => fetchEntries(page + 1)} disabled={page >= totalPages}
                  className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}