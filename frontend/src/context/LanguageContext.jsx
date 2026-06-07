import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    history: 'History',
    submit_sales: 'Submit Sales',
    shift: 'Shift',
    midday: 'Midday',
    afternoon: 'Afternoon',
    late: 'Late',
    open: 'Open',
    submitted: 'Submitted',
    missed: 'Missed',
    gross: 'Gross',
    expenses: 'Expenses',
    net: 'Net',
    reason: 'Reason',
    confirm: 'Confirm',
    cancel: 'Cancel',
    sign_out: 'Sign Out',
    target: 'Daily Target',
    commission: 'Your Commission',
    hello: 'Hello',
    today: 'Today',
    combined: 'Combined with missed shift(s)',
    no_entries: 'No entries yet',
    no_entries_message: 'Your submitted sales will appear here.',
    missed_message: 'Shift window closed. You can combine sales in the next available shift.',
    submitted_at: 'Submitted at',
    from: 'From',
    to: 'To',
    enter_gross: 'Enter gross amount collected',
    enter_expenses: 'Amount spent from sales',
    enter_reason: 'Explain why money was spent',
    review_submit: 'Review & Submit',
    confirm_submit: 'Confirm & Submit',
    cannot_edit: 'This cannot be edited or deleted after submission.',
    month_to_date: 'Month-to-date earnings',
  },
  lg: {
    dashboard: 'Olupapula Olusooka',
    history: 'Ebyafaayo',
    submit_sales: 'Waandiika Obusuubuzi',
    shift: 'Ekiseera',
    midday: 'Mu Ttuntu',
    afternoon: 'Olweggulo',
    late: 'Ekiro',
    open: 'Kiggule',
    submitted: 'Waandiikiddwa',
    missed: 'Kibuuse',
    gross: 'Gyorosii',
    expenses: 'Ebiyizziddwa',
    net: 'Netti',
    reason: 'Ensonga',
    confirm: 'Kakasa',
    cancel: 'Sazaamu',
    sign_out: 'Fuluma',
    target: 'Akagendererwa',
    commission: 'Komisooni',
    hello: 'Osiibye otya',
    today: 'Leero',
    combined: 'Bigasse',
    no_entries: 'Tewali biwandiikiddwa',
    no_entries_message: 'Ebiwandiiko byo bijja kulabika wano.',
    missed_message: 'Ekiseera kiyiseewo. Osobola okugatta obusuubuzi mu kiseera ekiddako.',
    submitted_at: 'Waandiikiddwa ku',
    from: 'Okuva',
    to: 'Okutuuka',
    enter_gross: 'Waandiika omuwendo gwa gyorosii',
    enter_expenses: 'Waandiika ebiyizziddwa',
    enter_reason: 'Nnyonnyola ensonga lwaki waaliwo ebiyizziddwa',
    review_submit: 'Kebera era Owaandiike',
    confirm_submit: 'Kakasa era Owaandiike',
    cannot_edit: 'Kino tekyinna kukyusibwa wala kusangulwa oluvannyuma lw\'okuwaandiika.',
    month_to_date: 'Okutuuka kati mu mwezi guno',
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.language || 'en';
  });

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'lg' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}