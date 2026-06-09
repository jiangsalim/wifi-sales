import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [stats, setStats] = useState({ daily: { gross: 0, expenses: 0, net: 0, count: 0 }, weekly: {} });
  const [chartData, setChartData] = useState([]);
  const [agentComparison, setAgentComparison] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/charts', { params: { month_year: selectedMonth } })
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data.chart_data || []);
        setAgentComparison(chartRes.data.agent_comparison || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const arrow = stats.weekly?.percentage_change >= 0 ? '↑' : '↓';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between container-site">
          <h1 className="text-base sm:text-lg font-bold">TABBU BUSINESS</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm hidden sm:block">{user?.name}</span>
            <button onClick={toggleLanguage} className="text-xs bg-blue-800 hover:bg-blue-900 px-1.5 sm:px-2 py-1 rounded">
              {language === 'en' ? '🇺🇬' : '🇬🇧'}
            </button>
            <button onClick={logout} className="text-xs sm:text-sm bg-blue-800 hover:bg-blue-900 px-2 sm:px-3 py-1 rounded">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Mobile Sub Navigation */}
      <div className="md:hidden bg-white border-b overflow-x-auto">
        <div className="flex px-2 py-2 gap-1">
          <NavLink to="/admin" end className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Dashboard</NavLink>
          <NavLink to="/admin/agents" className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Users</NavLink>
          <NavLink to="/admin/entries" className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Entries</NavLink>
          <NavLink to="/profile" className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Profile</NavLink>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-56 lg:w-64 bg-white border-r min-h-[calc(100vh-57px)] p-3 lg:p-4 shrink-0">
          <nav className="space-y-1">
            <NavLink to="/admin" end className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</NavLink>
            <NavLink to="/admin/agents" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Users</NavLink>
            <NavLink to="/admin/entries" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>Sales Entries</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>My Profile</NavLink>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-20 md:pb-6 min-w-0">
          <div className="container-site">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                <p className="text-xs text-gray-500">Today Gross</p>
                <p className="text-base sm:text-lg font-bold text-green-600">UGX {stats.daily.gross?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                <p className="text-xs text-gray-500">Today Net</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">UGX {stats.daily.net?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                <p className="text-xs text-gray-500">Submissions</p>
                <p className="text-base sm:text-lg font-bold">{stats.daily.count}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-base sm:text-lg font-bold">UGX {stats.weekly?.this_week_gross?.toLocaleString()}</p>
                <p className={`text-xs ${stats.weekly?.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {arrow} {Math.abs(stats.weekly?.percentage_change || 0)}% vs last week
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Daily Sales</h3>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm w-full sm:w-auto" />
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="gross" fill="#3b82f6" name="Gross" />
                    <Bar dataKey="net" fill="#10b981" name="Net" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">No data for this month</p>
              )}
            </div>

            {/* Agent Comparison */}
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-4">Agent Comparison</h3>
              {agentComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={agentComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="total_gross" fill="#3b82f6" name="Total Gross" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">No data for this month</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around">
          <NavLink to="/admin" end className={({ isActive }) => `flex flex-col items-center py-1.5 px-2 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </NavLink>
          <NavLink to="/admin/agents" className={({ isActive }) => `flex flex-col items-center py-1.5 px-2 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Users
          </NavLink>
          <NavLink to="/admin/entries" className={({ isActive }) => `flex flex-col items-center py-1.5 px-2 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Entries
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center py-1.5 px-2 text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile
          </NavLink>
        </div>
      </div>

      <Footer />
    </div>
  );
}