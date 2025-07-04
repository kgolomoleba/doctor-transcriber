// Settings.jsx – sleek 2025 refresh
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/* grab palette tokens */
const css = (v, f) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(v) || f
    : f;

const C = {
  CARD: css("--card", "#ffffff"),
  BORDER: css("--border", "#e2e8f0"),
  PRI: css("--primary", "#4f46e5"),
  TXT: css("--txt", "#1a202c"),
  TXT_SOFT: css("--txt-soft", "#475569"),
};

/* ───────────────────────── component ───────────────────────── */
export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);
  const [toast, setToast] = useState("");

  /* live demo theme */
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  /* quick toast helper */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const save = () => {
    // pretend API PATCH …
    showToast("Preferences saved ✅");
  };

  return (
    <>
      <section style={ui.card} aria-labelledby="settings-title">
        <h2 id="settings-title" style={ui.h2}>
          Settings
        </h2>

        {/* Appearance */}
        <fieldset style={ui.fs}>
          <legend style={ui.legend}>Appearance</legend>
          <Toggle
            label="Enable dark theme"
            checked={darkMode}
            onChange={() => setDarkMode((v) => !v)}
          />
          <p style={ui.hint}>
            This demo applies the theme instantly but won’t persist on refresh.
          </p>
        </fieldset>

        {/* Notifications */}
        <fieldset style={ui.fs}>
          <legend style={ui.legend}>Notifications</legend>
          <Toggle
            label="Email me when a note is ready"
            checked={notifEmail}
            onChange={() => setNotifEmail((v) => !v)}
          />
          <Toggle
            label="Occasional product tips (max 2 / month)"
            checked={notifProduct}
            onChange={() => setNotifProduct((v) => !v)}
          />
        </fieldset>

        {/* Save */}
        <button type="button" onClick={save} style={ui.saveBtn}>
          Save changes
        </button>
        <p style={ui.hint}>
          In production these values are loaded from your user profile and sent
          back via a PATCH request.
        </p>
      </section>

      {/* toast */}
      {toast &&
        createPortal(
          <div style={ui.toast}>{toast}</div>,
          document.body // render outside stacking context
        )}
    </>
  );
}

/* ───────────────────────── helpers ───────────────────────── */
function Toggle({ label, checked, onChange }) {
  return (
    <label style={ui.toggleRow}>
      <span style={{ flex: 1 }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={ui.input} /* hide */
      />
      <span aria-hidden="true" style={ui.switchBase(checked)}>
        <span style={ui.switchKnob(checked)} />
      </span>
    </label>
  );
}

/* ───────────────────────── styles ───────────────────────── */
const ui = {
  /* card wrapper */
  card: {
    background: C.CARD,
    border: `1px solid ${C.BORDER}`,
    borderRadius: 16,
    maxWidth: 720,
    margin: "0 auto",
    padding: 40,
    boxShadow: "0 8px 22px rgba(0,0,0,.06)",
  },
  h2: { fontSize: "1.7rem", color: C.PRI, margin: "0 0 32px" },

  /* sections */
  fs: {
    border: "none",
    padding: 0,
    marginBottom: 36,
    display: "grid",
    gap: 18,
  },
  legend: { fontWeight: 700, color: C.TXT, marginBottom: 8 },
  hint: { fontSize: 13, color: C.TXT_SOFT },

  /* toggle row */
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    color: C.TXT_SOFT,
    fontWeight: 500,
    flexWrap: "wrap",
  },

  /* visually‑hidden checkbox (keeps accessibility) */
  input: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: "none",
  },

  /* switch */
  switchBase: (on) => ({
    width: 44,
    height: 24,
    borderRadius: 24,
    background: on ? C.PRI : C.BORDER,
    transition: "background .25s",
    position: "relative",
    flexShrink: 0,
  }),
  switchKnob: (on) => ({
    position: "absolute",
    top: 3,
    left: on ? 24 : 4,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,.25)",
    transition: "left .25s",
  }),

  /* save */
  saveBtn: {
    marginTop: 8,
    background: C.PRI,
    color: "#fff",
    border: "none",
    padding: "12px 30px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  },

  /* toast */
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 22px",
    background: C.PRI,
    color: "#fff",
    borderRadius: 10,
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(0,0,0,.18)",
    animation: "fadeSlide 2.4s forwards",
    zIndex: 1000,
  },
};

/* add this once in your global CSS (e.g. index.css)
@keyframes fadeSlide {
  0%   { opacity: 0; transform: translate(-50%, 40px); }
  10%  { opacity: 1; transform: translate(-50%, 0);    }
  90%  { opacity: 1;                }
  100% { opacity: 0; transform: translate(-50%, -40px); }
}
*/
