// src/App.jsx – robust session handling (Jul 2025)

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { UserProvider } from "./UserContext";

/* eager */
import LandingPage   from "./pages/Landingpage";
import Login         from "./pages/Login";
import Signup        from "./pages/Signup";
import Skeleton      from "./components/Skeleton";
import DashboardHome from "./pages/DashboardHome";

/* lazy */
const Dashboard   = lazy(() => import("./components/Dashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Settings    = lazy(() => import("./pages/Settings"));
const Recorder    = lazy(() => import("./pages/Recorder"));
const Notes       = lazy(() => import("./pages/Notes"));

export default function App() {
  const [user, setUser]         = useState(null);
  const [loadingUser, setLoad]  = useState(true);

  /* ─────────────  bootstrap session  ───────────── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoad(false);
    })();

    // ⤵️ Supabase v2 returns { data: { subscription } }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );

    // cleanup (null‑check guards against undefined)
    return () => subscription?.unsubscribe();
  }, []);

  /* ─────────────  helpers  ───────────── */
  const onLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loadingUser) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <Skeleton rows={6} />
      </div>
    );
  }

  /* ─────────────  routes  ───────────── */
  const routes = (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />
        }
      />
      <Route
        path="/signup"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Signup onSignup={setUser} />
        }
      />

      {/* Protected */}
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <Dashboard user={user} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index           element={<DashboardHome />} />
        <Route path="profile"  element={<ProfilePage onProfileUpdate={setUser} />} />
        <Route path="settings" element={<Settings user={user} />} />
        <Route path="recorder" element={<Recorder />} />
        <Route path="notes"    element={<Notes />} />
      </Route>

      {/* 404 → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  /* ─────────────  render  ───────────── */
  return (
    <UserProvider>
      <Suspense fallback={<Skeleton rows={6} />}>{routes}</Suspense>
    </UserProvider>
  );
}
