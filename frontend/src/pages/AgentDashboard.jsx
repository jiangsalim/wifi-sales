import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ShiftCard from '../components/ShiftCard';
import SubmitModal from '../components/SubmitModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AgentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [commission, setCommission] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchShifts = useCallback(async () => {
    try {
      const data = await api.get('/agent/shifts/today');
      setShifts(data.data.shifts);
      setTodayTotal(data.data.today_total);
      setDailyTarget(data.data.daily_target);
      setPercentage(data.data.percentage);
    } catch (err) {
      console.error('Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const data = await api.get('/agent/commission');
        setCommission(data.data.commission);
        setCommissionRate(data.data.commission_rate);
      } catch (err) {}
    };
    fetchCommission();
  }, []);

  const handleOpenSubmit = (shiftId) => {
    setActiveShiftId(shiftId);
    setShowSubmit(true);
  };

  const handleSubmitSuccess = () => {
    fetchShifts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-4 pb-20">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('hello')}, {user?.name} 👋</h2>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>

        {/* Commission Card */}
        {commissionRate > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-green-300 bg-green-50 p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('commission')} ({commissionRate}%)</span>
              <span className="font-bold text-green-700">UGX {commission.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('month_to_date')}</p>
          </div>
        )}

        {/* Target Progress */}
        {dailyTarget > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">{t('target')}</h3>
              <span className={`text-sm font-bold ${percentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>UGX {todayTotal.toLocaleString()}</span>
              <span>{t('target')}: UGX {dailyTarget.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Shift Cards */}
        <div className="space-y-3">
          {shifts.map(shift => (
            <ShiftCard key={shift.id} shift={shift} onOpenSubmit={handleOpenSubmit} />
          ))}
        </div>
      </main>

      <BottomNav />

      {showSubmit && (
        <SubmitModal
          shiftId={activeShiftId}
          shifts={shifts}
          onClose={() => setShowSubmit(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}