import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-4 py-4">
        <Link to="/login" className="text-sm text-blue-200 hover:text-white">&larr; Back</Link>
        <h1 className="text-xl font-bold mt-2">Privacy Policy</h1>
      </div>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-sm text-gray-700 space-y-4">
          <p><strong>Last updated:</strong> June 2026</p>

          <h3 className="font-semibold text-gray-800">1. Information We Collect</h3>
          <p>We collect: user names, email addresses, assigned locations, daily sales figures, expenses, and shift submission times.</p>

          <h3 className="font-semibold text-gray-800">2. How We Use Your Data</h3>
          <p>Your data is used exclusively for business management, sales tracking, performance reporting, and commission calculation within the TABBU BUSINESS platform.</p>

          <h3 className="font-semibold text-gray-800">3. Data Storage</h3>
          <p>All data is stored securely in a database hosted on Render. Access is restricted to authorized administrators only.</p>

          <h3 className="font-semibold text-gray-800">4. Data Retention</h3>
          <p>Sales entries are stored permanently for audit and reporting purposes. Once submitted, they cannot be modified.</p>

          <h3 className="font-semibold text-gray-800">5. Data Sharing</h3>
          <p>We do not share, sell, or distribute your data to third parties. Data is only visible to the user and authorized administrators.</p>

          <h3 className="font-semibold text-gray-800">6. Security</h3>
          <p>We use industry-standard encryption (HTTPS) and JWT authentication to protect your data.</p>

          <h3 className="font-semibold text-gray-800">7. Your Rights</h3>
          <p>You may request a copy of your data or request account deactivation by contacting the administrator.</p>

          <h3 className="font-semibold text-gray-800">8. Contact</h3>
          <p>For privacy concerns, contact: <strong>jaingsalim@gmail.com</strong></p>
        </div>
      </main>
    </div>
  );
}