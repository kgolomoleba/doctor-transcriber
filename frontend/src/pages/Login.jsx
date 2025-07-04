import React, { useState, useCallback } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrorMsg("");

      if (!email.trim() || !password.trim()) {
        setErrorMsg("Please enter both email and password.");
        return;
      }

      setLoading(true);

      try {
        await new Promise((r) => setTimeout(r, 1000));

        // Dummy user data
        const userData = { email, name: "John Doe" };
        onLogin(userData);
      } catch {
        setErrorMsg("Login failed. Please try again.");
        setPassword(""); // Clear password on error
      } finally {
        setLoading(false);
      }
    },
    [email, password, onLogin]
  );

  return (
    <main style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <h2 style={styles.title}>Login</h2>

        <div
          role="alert"
          aria-live="polite"
          style={{ ...styles.error, visibility: errorMsg ? "visible" : "hidden" }}
        >
          {errorMsg || " "}
        </div>

        <label htmlFor="email" style={styles.label}>
          Email:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="you@example.com"
          required
          aria-required="true"
          disabled={loading}
        />

        <label htmlFor="password" style={styles.label}>
          Password:
        </label>
        <input
          id="password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          placeholder="Enter your password"
          required
          aria-required="true"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          style={{
            ...styles.button,
            opacity: loading || !email.trim() || !password.trim() ? 0.7 : 1,
            cursor: loading || !email.trim() || !password.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--bg, #eef2ff)",
    fontFamily: "'Nunito Sans', sans-serif",
    padding: 20,
  },
  form: {
    backgroundColor: "var(--card, #fff)",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
    color: "var(--primary-2, #4f46e5)",
    fontWeight: "700",
  },
  label: {
    fontWeight: "600",
    color: "var(--txt-soft, #374151)",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid var(--border, #cbd5e1)",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s",
  },
  error: {
    color: "var(--danger, #ef4444)",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    minHeight: 24,
  },
  button: {
    backgroundColor: "var(--primary-2, #4f46e5)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    fontSize: 18,
    fontWeight: "700",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.3s, opacity 0.3s",
  },
};
