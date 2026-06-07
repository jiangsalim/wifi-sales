import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      const dismissedAt = localStorage.getItem('installPromptDismissed');

      if (!isInstalled && !dismissedAt) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((result) => {
        if (result.outcome === 'accepted') {
          setShowPrompt(false);
        } else {
          localStorage.setItem('installPromptDismissed', Date.now());
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-blue-700 text-white px-4 py-3 z-50 flex items-center justify-between">
      <span className="text-sm">Install this app on your phone</span>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium">Install</button>
        <button onClick={handleDismiss} className="text-blue-200 text-sm">✕</button>
      </div>
    </div>
  );
}