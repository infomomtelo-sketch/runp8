import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TrainingDashboard from './pages/TrainingDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        
        <main className="flex-grow">
          <Routes>
            {/* This line maps your new page to the /training web address */}
            <Route path="/training" element={<TrainingDashboard />} />

            {/* This safety fallback prevents broken or empty links */}
            <Route path="*" element={<Navigate to="/training" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Title22.app Compliance Engine • Safe & Secure
        </footer>

      </div>
    </Router>
  );
}
