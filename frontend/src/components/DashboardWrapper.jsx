// src/components/DashboardWrapper.jsx
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../UserContext";
import Dashboard from "./Dashboard";

export default function DashboardWrapper() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();        // global context
  const mounted = useRef(true);

  /* ------------------------------------------------------------------
   * 1.  Boot‑time check – is there a session?
   * ------------------------------------------------------------------ */
  useEffect(() => {
    mounted.current = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted.current) return;           // component unmounted
      if (data?.user) setUser(data.user);
      else navigate("/", { replace: true });
    })();

    /* ----------------------------------------------------------------
     * 2.  Live listener – auth state changes (login / logout / token refresh)
     * ---------------------------------------------------------------- */
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted.current) return;
      if (session?.user) setUser(session.user);
      else {
        setUser(null);
        navigate("/", { replace: true });
      }
    });

    /* cleanup */
    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, setUser]);

  /* ------------------------------------------------------------------
   * Logout handler – memoised so children don’t re‑render every time
   * ------------------------------------------------------------------ */
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire → navigate("/", …) happens there
  }, []);

  /* ------------------------------------------------------------------
   * UI
   * ------------------------------------------------------------------ */
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito Sans', sans-serif",
          color: "var(--txt-soft)",
        }}
      >
        Loading…
      </div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
