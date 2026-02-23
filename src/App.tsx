import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { KeywordsScreen } from './screens/KeywordsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { runMockFetchJob } from './api/mockFetchJob';

// A layout with BottomNav and better content centering
const AppLayout = () => {
  return (
    <div className="app-container">
      <BottomNav />
      <Outlet />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Run mock fetch job once on startup to seed news items if none exist
    runMockFetchJob();

    // In a real app, this would be a CRON job on the server
    const interval = setInterval(runMockFetchJob, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected Routes Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/keywords" element={<KeywordsScreen />} />
          <Route path="/favorites" element={<FavoritesScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
