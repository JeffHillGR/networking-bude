import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Events from './components/Events.jsx';
import Settings from './components/Settings.jsx';

function App() {
  // Check if user completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route 
          path="/" 
          element={hasCompletedOnboarding ? <Navigate to="/dashboard" /> : <OnboardingFlow />} 
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;