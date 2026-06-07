import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-4 py-4">
        <Link to="/login" className="text-sm text-blue-200 hover:text-white">&larr; Back</Link>
        <h1 className="text-xl font-bold mt-2">Terms & Conditions</h1>
      </div>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-sm text-gray-700 space-y-4">
          <p><strong>Last updated:</strong> June 2026</p>

          <h3 className="font-semibold text-gray-800">1. Acceptance of Terms</h3>
          <p>By accessing and using the BEN WIFISPOT Sales Management System, you agree to be bound by these Terms and Conditions.</p>

          <h3 className="font-semibold text-gray-800">2. Description of Service</h3>
          <p>BEN WIFISPOT provides a WiFi hotspot sales tracking platform. Agents submit daily sales figures across three shifts. All submissions are final and cannot be edited or deleted.</p>

          <h3 className="font-semibold text-gray-800">3. User Responsibilities</h3>
          <p>Agents are responsible for submitting accurate sales figures. Any expenses claimed must include a valid reason. Falsifying data may result in account deactivation.</p>

          <h3 className="font-semibold text-gray-800">4. Data Immutability</h3>
          <p>Once a sales entry is submitted, it cannot be modified or deleted by the agent or the administrator. This ensures transparency and accountability.</p>

          <h3 className="font-semibold text-gray-800">5. Privacy</h3>
          <p>Your data is stored securely and used only for sales tracking purposes. See our Privacy Policy for details.</p>

          <h3 className="font-semibold text-gray-800">6. Account Management</h3>
          <p>Administrators reserve the right to activate or deactivate agent accounts. Inactive accounts cannot access the system.</p>

          <h3 className="font-semibold text-gray-800">7. Limitation of Liability</h3>
          <p>BEN WIFISPOT is not liable for any losses resulting from inaccurate data entry or system downtime.</p>

          <h3 className="font-semibold text-gray-800">8. Contact</h3>
          <p>For questions, contact: <strong>jaingsalim@gmail.com</strong></p>
        </div>
      </main>
    </div>
  );
}