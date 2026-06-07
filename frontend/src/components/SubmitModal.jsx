import { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function SubmitModal({ shiftId, shifts, onClose, onSuccess }) {
  const { t } = useLanguage();
  const shift = shifts.find(s => s.id === shiftId);
  const [totalSales, setTotalSales] = useState('');
  const [expenses, setExpenses] = useState('0');
  const [expenseReason, setExpenseReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const net = (parseInt(totalSales) || 0) - (parseInt(expenses) || 0);

  const handleSubmit = () => {
    if (!totalSales || parseInt(totalSales) < 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (parseInt(expenses) > 0 && !expenseReason) {
      setError('Please provide a reason for expenses');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/entries', {
        shift_id: shiftId,
        total_sales: parseInt(totalSales),
        expenses: parseInt(expenses) || 0,
        expense_reason: parseInt(expenses) > 0 ? expenseReason : null,
      });
      setSuccess('Entry submitted successfully. This cannot be edited.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
          <div className="text-green-500 text-5xl mb-3">✓</div>
          <p className="text-gray-800 font-semibold">{success}</p>
          <button onClick={onClose} className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">OK</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-lg mb-4">{t('submit_sales')}</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          {shift && (
            <p className="text-sm text-gray-500 mb-3">
              {t('shift')}: <strong>{shift.name}</strong> ({shift.start_time} - {shift.end_time})
            </p>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('gross')} (UGX)</label>
              <input type="number" value={totalSales} onChange={e => setTotalSales(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('enter_gross')} min="0" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('expenses')} (UGX)</label>
              <input type="number" value={expenses} onChange={e => { setExpenses(e.target.value); if (e.target.value === '0') setExpenseReason(''); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('enter_expenses')} min="0" />
            </div>

            {parseInt(expenses) > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('reason')} *</label>
                <textarea value={expenseReason} onChange={e => setExpenseReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2" placeholder={t('enter_reason')} />
              </div>
            )}

            <button onClick={handleSubmit}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-800">
              {t('review_submit')}
            </button>
          </div>

          <button onClick={onClose}
            className="mt-3 w-full bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            {t('cancel')}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-3">{t('confirm')}</h3>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p><strong>{t('shift')}:</strong> {shift?.name}</p>
              <p><strong>{t('gross')}:</strong> UGX {parseInt(totalSales).toLocaleString()}</p>
              <p><strong>{t('expenses')}:</strong> UGX {(parseInt(expenses) || 0).toLocaleString()}</p>
              {parseInt(expenses) > 0 && <p><strong>{t('reason')}:</strong> {expenseReason}</p>}
              <p><strong>{t('net')}:</strong> UGX {net.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded mb-4">
              ⚠️ {t('cannot_edit')}
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirm} disabled={loading}
                className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-800 disabled:opacity-50">
                {loading ? 'Submitting...' : t('confirm_submit')}
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-300">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}