import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Dashboard from './components/Dashboard.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Events from './components/Events.jsx';
import EventDetail from './components/EventDetail.jsx';
import ResourcesInsights from './components/ResourcesInsights.jsx';
import Settings from './components/Settings.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Component to protect routes and preserve return URL
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    // Store the current location they were trying to go to
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    sessionStorage.setItem('returnUrl', returnUrl);
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={<OnboardingFlow />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/events"
          element={<ProtectedRoute><Events /></ProtectedRoute>}
        />
        <Route
          path="/events/:eventId"
          element={<ProtectedRoute><EventDetail /></ProtectedRoute>}
        />
        <Route
          path="/resources-insights"
          element={<ProtectedRoute><ResourcesInsights /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;