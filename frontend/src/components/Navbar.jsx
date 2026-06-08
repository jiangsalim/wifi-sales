import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-blue-300 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold">TABBU BUSINESS</h1>
            <p className="text-xs text-blue-200">{user?.location || 'Agent'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:block">{user?.name}</span>
          <button onClick={toggleLanguage} className="text-xs bg-blue-800 hover:bg-blue-900 px-2 py-1 rounded">
            {language === 'en' ? '🇺🇬 LG' : '🇬🇧 EN'}
          </button>
          <button onClick={logout} className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded">
            {t('sign_out')}
          </button>
        </div>
      </div>
    </nav>
  );
}