import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8 py-6 px-4">
      <div className="max-w-4xl mx-auto container-site">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-3">
          <Link to="/terms" className="hover:text-blue-600">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact</Link>
        </div>
        <div className="text-center mb-3">
          <button
            onClick={() => {
              if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
              } else {
                alert('App is already installed or not available. Open this page in Chrome on your phone and tap "Add to Home Screen" from the menu.');
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            📱 Download App
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} TABBU BUSINESS. All rights reserved.
        </p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Built by{' '}
          <a
            href="https://herman-software-website.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Herman Software
          </a>
        </p>
      </div>
    </footer>
  );
}