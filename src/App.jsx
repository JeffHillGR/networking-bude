import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Dashboard from './components/Dashboard.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Events from './components/Events.jsx';
import EventDetail from './components/EventDetail.jsx';
import Settings from './components/Settings.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

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
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/events"
          element={user ? <Events /> : <Navigate to="/" />}
        />
        <Route
          path="/events/:eventId"
          element={user ? <EventDetail /> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;