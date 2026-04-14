import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import CreateSurvey from './pages/createSurvey';
import SurveyView from './pages/surveyView';
import Analytics from './pages/analytics';
import SendInvitations from './pages/sendInvitations';
import Navbar from './components/navbar';


import { AuthProvider, useAuth } from './contexts/authContext';
import { AnimatePresence } from 'motion/react';
import { PageTransition, LoadingSpinner } from './components/loadingState';
import { useLocation } from 'react-router-dom';

function AppContent() {
  /**
   * protectedRoute component to guard routes that require authentication. it checks the auth context for a token and loading state. if loading, it shows a loading message. if no token is found, it redirects to the login page. otherwise, it renders the child components.
   * this ensures that only authenticated users can access certain routes like the dashboard, survey creation, editing, analytics, and invitation sending pages.
   */
  const { token, loading } = useAuth();
  const location = useLocation();

  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    // if the authentication state is still loading, show a loading message
    if (loading) return <LoadingSpinner />;
    // if no token is found, redirect to the login page
    if (!token) return <Navigate to="/login" replace />;
    // if a token is found, render the child components
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* @ts-ignore - Routes component does not explicitly define key prop, but it is needed for AnimatePresence */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/survey/:id" element={<PageTransition><SurveyView /></PageTransition>} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <PageTransition><CreateSurvey /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <PageTransition><CreateSurvey /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/analytics/:id" element={
              <ProtectedRoute>
                <PageTransition><Analytics /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/invite/:id" element={
              <ProtectedRoute>
                <PageTransition><SendInvitations /></PageTransition>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
