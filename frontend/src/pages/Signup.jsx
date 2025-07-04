import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState("");
  const [loading, setL] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (![name, email, password, confirm].every(Boolean)) {
      return setErr("All fields are required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setErr("Enter a valid e-mail.");
    }
    if (password.length < 6) return setErr("Min 6 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");

    setL(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
      setL(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
    });

    if (profileError) {
      setErr(profileError.message);
      setL(false);
      return;
    }

    onSignup({
      id: data.user.id,
      email: data.user.email,
      name,
    });
  };

  return (
    <div style={s.container}>
      <form onSubmit={handleSubmit} style={s.form} noValidate>
        <h2 style={s.title}>Create an account</h2>

        {err && <div style={s.error}>{err}</div>}

        <label style={s.label}>
          Full name
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={s.input}
            disabled={loading}
            autoFocus
            required
          />
        </label>

        <label style={s.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={s.input}
            disabled={loading}
            required
          />
        </label>

        <label style={s.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            style={s.input}
            disabled={loading}
            required
          />
        </label>

        <label style={s.label}>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={s.input}
            disabled={loading}
            required
          />
        </label>

        <button type="submit" style={s.button} disabled={loading}>
          {loading ? "Signing up…" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

/* ---------- inline styles (unchanged palette) ---------- */
const s = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    fontFamily: "'Nunito Sans', sans-serif",
    padding: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 8,
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    marginBottom: 12,
    color: "#4f46e5",
    fontSize: "1.8rem",
    textAlign: "center",
  },
  label: { fontWeight: 600, color: "#374151", display: "flex", flexDirection: "column" },
  input: {
    marginTop: 6,
    padding: "12px 14px",
    fontSize: 16,
    borderRadius: 6,
    border: "1.5px solid #d1d5db",
  },
  button: {
    marginTop: 8,
    padding: 14,
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 12,
    borderRadius: 6,
    textAlign: "center",
  },
};