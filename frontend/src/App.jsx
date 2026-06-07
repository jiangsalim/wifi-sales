import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import AgentHistory from './pages/AgentHistory';
import AdminDashboard from './pages/AdminDashboard';

function AdminAgents() { return <div>Admin Agents - Coming in Phase 12</div>; }
function AdminEntries() { return <div>Admin Entries - Coming in Phase 12</div>; }

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute role="agent"><AgentHistory /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/agents" element={<ProtectedRoute role="admin"><AdminAgents /></ProtectedRoute>} />
            <Route path="/admin/entries" element={<ProtectedRoute role="admin"><AdminEntries /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;