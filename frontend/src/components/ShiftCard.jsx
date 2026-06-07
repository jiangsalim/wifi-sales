import { useLanguage } from '../context/LanguageContext';

export default function ShiftCard({ shift, onOpenSubmit }) {
  const { t } = useLanguage();

  const statusColors = {
    submitted: 'border-blue-300 bg-blue-50',
    missed: 'border-red-300 bg-red-50',
    open: 'border-green-300 bg-green-50',
  };

  const badgeColors = {
    submitted: 'bg-blue-200 text-blue-800',
    missed: 'bg-red-200 text-red-800',
    open: 'bg-green-200 text-green-800',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${statusColors[shift.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{t(shift.name.toLowerCase())}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[shift.status]}`}>
          {t(shift.status)}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-2">
        {shift.start_time} - {shift.end_time}
      </p>

      {shift.status === 'submitted' && (
        <div className="text-sm">
          <p className="text-gray-600">{t('gross')}: <span className="font-medium">UGX {shift.gross?.toLocaleString()}</span></p>
          <p className="text-gray-500 text-xs">{t('submitted_at')} {shift.submitted_at}</p>
        </div>
      )}

      {shift.status === 'missed' && (
        <p className="text-xs text-red-600">{t('missed_message')}</p>
      )}

      {shift.status === 'open' && (
        <button
          onClick={() => onOpenSubmit(shift.id)}
          className="mt-2 w-full bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-800 active:bg-blue-900 transition"
        >
          {t('submit_sales')}
        </button>
      )}
    </div>
  );
}