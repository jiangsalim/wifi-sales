import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function AdminEntries() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const data = await api.get('/admin/entries', { params });
      setEntries(data.data.entries);
    } catch (err) {
      console.error('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/entries/${id}`);
      setDeleteConfirm(null);
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry');
    }
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    window.open(`https://wifi-sales-api.onrender.com/api/admin/export/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">BEN WIFISPOT</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="text-xs bg-blue-800 hover:bg-blue-900 px-2 py-1 rounded">
              {language === 'en' ? '🇺🇬 LG' : '🇬🇧 EN'}
            </button>
            <button onClick={logout} className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <div className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-57px)] p-4">
          <nav className="space-y-1">
            <NavLink to="/admin" end className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</NavLink>
            <NavLink to="/admin/agents" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Agents</NavLink>
            <NavLink to="/admin/entries" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Sales Entries</NavLink>
          </nav>
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Sales Entries</h2>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              Export CSV
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={fetchEntries} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Filter</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Agent</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Shift</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Gross</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Expenses</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Net</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{entry.agent_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">{entry.agent_location || '-'}</td>
                      <td className="px-4 py-3">{entry.shift_name}</td>
                      <td className="px-4 py-3 text-gray-500">{entry.entry_date}</td>
                      <td className="px-4 py-3">UGX {entry.total_sales?.toLocaleString()}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-red-600">UGX {entry.expenses?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-600">UGX {entry.net?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteConfirm(entry.id)} className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr><td colSpan="8" className="text-center py-8 text-gray-500">No entries found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-gray-800 mb-2">Delete Entry?</p>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone. The sales entry will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around">
          <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center py-2 px-3 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>Dashboard</NavLink>
          <NavLink to="/admin/agents" className={({ isActive }) => `flex flex-col items-center py-2 px-3 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>Agents</NavLink>
          <NavLink to="/admin/entries" className={({ isActive }) => `flex flex-col items-center py-2 px-3 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>Entries</NavLink>
        </div>
      </div>
    </div>
  );
}