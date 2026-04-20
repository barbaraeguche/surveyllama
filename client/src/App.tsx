import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateSurvey from "./pages/CreateSurvey";
import SurveyView from "./pages/SurveyView";
import Analytics from "./pages/Analytics";
import SendInvitations from "./pages/SendInvitations";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AnimatePresence } from "motion/react";
import { PageTransition, LoadingSpinner } from "./components/LoadingState";
import { useLocation } from "react-router-dom";

function AppContent() {
  /**
   * ProtectedRoute component to guard routes that require authentication. It checks the auth context for a token and loading state. If loading, it shows a loading message. If no token is found, it redirects to the login page. Otherwise, it renders the child components.
   * This ensures that only authenticated users can access certain routes like the dashboard, survey creation, editing, analytics, and invitation sending pages.
   */
  const { token, loading } = useAuth();
  const location = useLocation();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // If the authentication state is still loading, show a loading message
    if (loading) return <LoadingSpinner />;
    // If no token is found, redirect to the login page
    if (!token) return <Navigate to="/login" replace />;
    // If a token is found, render the child components
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* @ts-ignore - Routes component does not explicitly define key prop but it is needed for AnimatePresence */}
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/survey/:id"
              element={
                <PageTransition>
                  <SurveyView />
                </PageTransition>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <CreateSurvey />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <CreateSurvey />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Analytics />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invite/:id"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <SendInvitations />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
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
