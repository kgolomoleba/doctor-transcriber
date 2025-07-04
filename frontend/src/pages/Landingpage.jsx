// src/pages/LandingPage.jsx
import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaRocket,
  FaMobileAlt,
  FaShieldAlt,
  FaRegSmile,
  FaUserPlus,
  FaSignInAlt,
  FaTimes,
  FaClipboardCheck,
  FaLock,
} from "react-icons/fa";
import { supabase } from "../supabaseClient";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const cssVar = (v, fallback) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(v) || fallback
    : fallback;

const usePalette = () =>
  useMemo(
    () => ({
      PRI: cssVar("--primary", "#4f46e5"),
      PRI_LIGHT: cssVar("--primary-light", "#6366f1"),
      TXT_SOFT: cssVar("--txt-soft", "#475569"),
      BORDER: cssVar("--border", "#cbd5e1"),
      BG_SLATE: cssVar("--bg-light", "#eef2ff"),
    }),
    []
  );

const useFadeUp = () => {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 32 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: { delay: 0.12 * i, duration: 0.55 },
        }),
      };
};

/* ------------------------------------------------------------------ */
/* tiny shared bits                                                    */
/* ------------------------------------------------------------------ */
const CTA = ({ children, icon, onClick, palette }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 28px",
      borderRadius: 12,
      fontWeight: 700,
      border: "none",
      background: palette.PRI_LIGHT,
      color: "#fff",
      cursor: "pointer",
      boxShadow: "0 6px 18px rgba(99,102,241,.35)",
      transition: "transform .25s, background-color .25s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.background = palette.PRI;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.background = palette.PRI_LIGHT;
    }}
  >
    {icon}
    {children}
  </button>
);

const baseInput = (border) => ({
  padding: "10px 12px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  fontSize: 16,
  outline: "none",
});

function AuthForm({ mode, onSubmit, loading, error, palette }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const style = baseInput(palette.BORDER);

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ mode, email, password, name: name.trim() });
      }}
    >
      {mode === "signup" && (
        <input
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={style}
        />
      )}
      <input
        required
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={style}
      />
      <input
        required
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={style}
      />
      {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          ...style,
          background: palette.PRI,
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {loading ? "Loading…" : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </form>
  );
}

const FeatureCard = ({ icon, title, text, idx, variants }) => (
  <motion.div
    custom={idx}
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.25 }}
    style={{
      background: "var(--card)",
      borderRadius: 14,
      padding: 24,
      boxShadow: "0 4px 12px rgba(0,0,0,.05)",
      textAlign: "center",
    }}
  >
    {icon}
    <h3 style={{ margin: "12px 0 6px", fontSize: "1.1rem", fontWeight: 700 }}>
      {title}
    </h3>
    <p style={{ fontSize: 14, color: "var(--txt-soft)" }}>{text}</p>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/* main component                                                      */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const palette = usePalette();
  const variants = useFadeUp();
  const navigate = useNavigate();

  const [modal, setModal] = useState(null); // 'login' | 'signup' | null
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState("");

  /* ---------------- dynamic data ---------------- */
  const FEATURES = useMemo(
    () => [
      {
        icon: <FaRocket size={26} color={palette.PRI_LIGHT} />,
        title: "Fast drafts",
        text: "Under 10 s median from audio → SOAP (June 2025 bench).",
      },
      {
        icon: <FaMobileAlt size={26} color={palette.PRI_LIGHT} />,
        title: "Works everywhere",
        text: "iOS · Android · Web – offline capture if Wi‑Fi drops.",
      },
      {
        icon: <FaShieldAlt size={26} color={palette.PRI_LIGHT} />,
        title: "HIPAA‑ready",
        text: "AES‑256 at rest, TLS 1.3 in transit, BAA on paid tiers.",
      },
      {
        icon: <FaRegSmile size={26} color={palette.PRI_LIGHT} />,
        title: "Zero learning curve",
        text: "Open recorder → dictate → review → export.",
      },
    ],
    [palette]
  );

  const HOW = [
    "Tap record and speak normally.",
    "AI transcribes + tags SOAP sections on‑device.",
    "Review (avg edit time ≤ 20 s).",
    "One‑click export to your EHR (FHIR/HL7).",
  ];

  const TESTIMONIALS = [
    {
      quote:
        "I save about eight minutes per visit – that’s an extra patient daily.",
      by: "Dr Sarah Lee — Family Medicine",
    },
    {
      quote:
        "Finally an engine that handles cardiology jargon better than Dragon.",
      by: "Dr Michael Tran — Cardiology",
    },
    {
      quote: "Offline mode lets us chart in remote clinics with spotty LTE.",
      by: "Jamie Wong, RN",
    },
  ];

  /* ---------------- auth logic ---------------- */
  const handleAuth = async ({ mode, email, password, name }) => {
    setWorking(true);
    setErr("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        alert("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
      setModal(null);
    } catch (e) {
      setErr(e.message || "Something went wrong, please try again.");
    }
    setWorking(false);
  };

  /* ---------------- render ---------------- */
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily: "'Nunito Sans', sans-serif",
      }}
    >
      {/* hero */}
      <section style={{ textAlign: "center", marginBottom: 64 }}>
        <motion.h1
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{
            fontSize: "2.6rem",
            fontWeight: 900,
            color: palette.PRI,
          }}
        >
          Simplify your medical notes
        </motion.h1>
        <motion.p
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{
            fontSize: "1.1rem",
            color: palette.TXT_SOFT,
            maxWidth: 620,
            margin: "22px auto",
          }}
        >
          Dictate once → get accurate, structured SOAP drafts in seconds.
        </motion.p>
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          custom={2}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <CTA
            palette={palette}
            onClick={() => setModal("signup")}
            icon={<FaUserPlus />}
          >
            Create account
          </CTA>
          <CTA
            palette={palette}
            onClick={() => setModal("login")}
            icon={<FaSignInAlt />}
          >
            Log in
          </CTA>
        </motion.div>
      </section>

      {/* auth modal */}
      {modal && (
        <motion.div
          role="presentation"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(3px)",
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => !working && setModal(null)}
          onKeyDown={(e) => e.key === "Escape" && !working && setModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            style={{
              background: "var(--card)",
              borderRadius: 14,
              padding: 32,
              width: "90%",
              maxWidth: 420,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={() => !working && setModal(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                fontSize: 20,
                color: palette.TXT_SOFT,
                cursor: "pointer",
              }}
            >
              <FaTimes />
            </button>
            <h2
              style={{
                fontSize: "1.4rem",
                marginBottom: 16,
                color: palette.PRI,
              }}
            >
              {modal === "signup" ? "Create account" : "Log in"}
            </h2>
            <AuthForm
              mode={modal}
              loading={working}
              error={err}
              onSubmit={handleAuth}
              palette={palette}
            />
          </motion.div>
        </motion.div>
      )}

      {/* features */}
      <motion.section
        variants={
          useReducedMotion()
            ? undefined
            : { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
        }
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          margin: "64px 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
        }}
      >
        {FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            {...f}
            idx={i}
            variants={variants}
          />
        ))}
      </motion.section>

      {/* how it works */}
      <section
        style={{
          background: palette.BG_SLATE,
          borderRadius: 12,
          padding: 36,
          margin: "64px 0",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: palette.PRI,
            marginBottom: 24,
            fontSize: "1.6rem",
            fontWeight: 700,
          }}
        >
          How it works
        </h2>
        <ol
          style={{
            maxWidth: 700,
            margin: "0 auto",
            color: palette.TXT_SOFT,
            lineHeight: 1.6,
          }}
        >
          {HOW.map((step) => (
            <li key={step} style={{ marginBottom: 12 }}>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* security */}
      <section style={{ margin: "64px 0", textAlign: "center" }}>
        <FaLock size={32} color={palette.PRI} />
        <h2
          style={{
            fontSize: "1.55rem",
            margin: "12px 0",
            color: palette.PRI,
            fontWeight: 700,
          }}
        >
          Security & compliance
        </h2>
        <p
          style={{
            maxWidth: 650,
            margin: "0 auto",
            color: palette.TXT_SOFT,
          }}
        >
          Data encrypted at rest (AES‑256) & in transit (TLS 1.3). Hosted on
          ISO 27001‑certified infrastructure. BAAs available on Growth plan.
        </p>
      </section>

      {/* testimonials */}
      <section
        style={{
          margin: "64px 0",
          maxWidth: 820,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: palette.PRI,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          What clinicians say
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.by}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 * i, duration: 0.55 }}
              style={{
                background: palette.BG_SLATE,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 5px 16px rgba(0,0,0,0.05)",
                fontStyle: "italic",
                color: palette.TXT_SOFT,
              }}
            >
              <p style={{ margin: "0 0 12px" }}>&ldquo;{t.quote}&rdquo;</p>
              <footer
                style={{ fontWeight: 600, color: palette.PRI, marginTop: 4 }}
              >
                &mdash; {t.by}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section
        style={{
          textAlign: "center",
          padding: 40,
          background: palette.PRI,
          color: "#fff",
          borderRadius: 12,
          marginBottom: 90,
        }}
      >
        <h2
          style={{
            marginBottom: 12,
            fontSize: "1.8rem",
            fontWeight: 800,
          }}
        >
          Ready to draft your first note?
        </h2>
        <p style={{ marginBottom: 24, opacity: 0.9 }}>
          Start free. Cancel any time if it doesn’t save 5 min per visit within
          a week.
        </p>
        <CTA
          palette={{ ...palette, PRI_LIGHT: "#ffffff", PRI: "#e0e7ff" }}
          icon={<FaClipboardCheck />}
          onClick={() => setModal("signup")}
        >
          Get started — it’s free
        </CTA>
      </section>
    </main>
  );
}
