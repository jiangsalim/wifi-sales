import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white px-4 py-4">
        <Link to="/login" className="text-sm text-blue-200 hover:text-white">&larr; Back</Link>
        <h1 className="text-xl font-bold mt-2">Contact</h1>
      </div>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-sm text-gray-700 space-y-4 text-center">
          <h3 className="font-semibold text-gray-800 text-lg">TABBU BUSINESS</h3>
          <p>Business Management Platform</p>
          <div className="space-y-2">
            <p><strong>Email:</strong> jaingsalim@gmail.com</p>
            <p><strong>Developer:</strong> jiangsalim</p>
            <p><strong>GitHub:</strong> github.com/jiangsalim/wifi-sales</p>
          </div>
          <p className="text-gray-500 mt-4">For support, account issues, or general inquiries, please email us.</p>
        </div>
      </main>
    </div>
  );
}