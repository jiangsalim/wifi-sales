import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-3">
          <Link to="/terms" className="hover:text-blue-600">Terms & Conditions</Link>
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-blue-600">Contact</Link>
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