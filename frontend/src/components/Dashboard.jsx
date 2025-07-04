// Dashboard.jsx — responsive shell with animated sidebar (Jul 2025)

import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUser,
  FaCog,
  FaMicrophone,
  FaStickyNote,
  FaSignOutAlt,
} from "react-icons/fa";

/* design tokens pulled from :root */
const css = (v, d) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(v) || d
    : d;

const C = {
  BG: css("--bg", "#f8fafc"),
  CARD: css("--card", "#ffffff"),
  GLASS: css("--glass", "rgba(255,255,255,.8)"),
  BORDER: css("--border", "#e2e8f0"),
  TXT: css("--txt", "#1a202c"),
  TXT_SOFT: css("--txt-soft", "#475569"),
  PRI: css("--primary", "#4f46e5"),
  PRI_DARK: css("--primary-2", "#4338ca"),
  DANGER: css("--danger", "#ef4444"),
};

/* nav config */
const NAV = [
  { to: "/dashboard", icon: <FaHome />, label: "Home", end: true },
  { to: "profile", icon: <FaUser />, label: "Profile" },
  { to: "settings", icon: <FaCog />, label: "Settings" },
  { to: "recorder", icon: <FaMicrophone />, label: "Recorder" },
  { to: "notes", icon: <FaStickyNote />, label: "Notes" },
];

export default function Dashboard({ user, onLogout }) {
  const [open, setOpen] = useState(false); // mobile drawer
  const loc = useLocation();
  const drawerRef = useRef(null);

  /* ------- close drawer on route change / Esc ------- */
  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ------- utility ------- */
  const linkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    color: active ? "#fff" : C.TXT_SOFT,
    background: active ? C.PRI : "transparent",
    position: "relative",
    textDecoration: "none",
    transition: "background .25s,color .25s",
  });

  /* ------- indicator position ------- */
  const activeIndex = NAV.findIndex((n) =>
    n.end ? loc.pathname === n.to : loc.pathname.startsWith(`/dashboard/${n.to}`)
  );

  return (
    <>
      {/* top bar (always visible) */}
      <header style={S.topBar}>
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          style={S.burger}
        >
          <FaBars />
        </button>
        <h1 style={S.title}>
          Welcome,&nbsp;{user?.user_metadata?.name || user?.email}
        </h1>
      </header>

      {/* sidebar / drawer */}
      <aside
        ref={drawerRef}
        style={{
          ...S.sidebar,
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* logo / collapse on tablet+ */}
        <div style={S.logoRow}>
          <span style={{ fontWeight: 900, color: C.PRI }}>AI Scribe</span>
          <button
            style={{ ...S.burger, fontSize: 20 }}
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>

        <nav style={S.nav} aria-label="Main navigation">
          {/* animated rail */}
          <span
            aria-hidden
            style={{
              ...S.rail,
              top: activeIndex * 52 + 8, // 52 = link height + gap
              opacity: activeIndex === -1 ? 0 : 1,
            }}
          />
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => linkStyle(isActive)}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={onLogout} style={S.logout}>
          <FaSignOutAlt /> Log out
        </button>
      </aside>

      {/* overlay when drawer open on mobile */}
      {open && <div style={S.backdrop} onClick={() => setOpen(false)} />}

      {/* routed pages */}
      <main style={S.pageWrap}>
        <Outlet context={{ user }} />
      </main>
    </>
  );
}

/* ------------ styles ------------ */
const S = {
  /* top bar */
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 24px",
    background: C.CARD,
    borderBottom: `1px solid ${C.BORDER}`,
    boxShadow: "0 4px 8px rgba(0,0,0,.04)",
  },
  burger: {
    background: "none",
    border: "none",
    fontSize: 22,
    color: C.PRI,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: C.PRI_DARK,
  },

  /* sidebar / drawer */
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    background: C.GLASS,
    backdropFilter: "blur(14px)",
    borderRight: `1px solid ${C.BORDER}`,
    boxShadow: "2px 0 24px rgba(0,0,0,.06)",
    transition: "transform .35s cubic-bezier(.4,0,.2,1)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    backdropFilter: "blur(2px)",
    zIndex: 30,
  },
  logoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: "4px 6px 12px",
    borderBottom: `1px solid ${C.BORDER}`,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    marginTop: 12,
    flex: 1,
  },
  rail: {
    position: "absolute",
    left: 4,
    width: 4,
    height: 36,
    borderRadius: 4,
    background: C.PRI,
    transition: "top .35s cubic-bezier(.4,0,.2,1),opacity .3s",
  },
  logout: {
    marginTop: 12,
    background: C.DANGER,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(239,68,68,.35)",
  },

  /* page wrapper */
  pageWrap: {
    padding: 24,
    background: C.BG,
    minHeight: "calc(100vh - 64px)", // minus top bar
  },
};

/* -------- media: keep sidebar fixed on md+ -------- */
const mq = window.matchMedia("(min-width: 768px)");
const setDesktop = (yes) => {
  Object.assign(S.sidebar, {
    transform: yes ? "translateX(0)" : S.sidebar.transform,
  });
  Object.assign(S.backdrop, { display: yes ? "none" : "block" });
};
setDesktop(mq.matches);
mq.addEventListener("change", (e) => setDesktop(e.matches));
