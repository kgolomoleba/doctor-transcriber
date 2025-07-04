import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function ProfilePage({ onProfileUpdate }) {
  const { user } = useOutletContext() || {};

  // Initialize states with safe defaults (empty strings)
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [msg, setMsg] = useState("");

  // If user is not loaded yet, show loading
  if (!user) {
    return (
      <div style={styles.loadingWrapper}>
        <p style={styles.loadingText}>Loading user data...</p>
      </div>
    );
  }

  const save = () => {
    onProfileUpdate({ name, email });
    setMsg("Profile updated ✔️");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h3 style={styles.h3}>Edit Profile</h3>
        {msg && <p style={styles.msg}>{msg}</p>}

        <label style={styles.label}>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="Your name"
            aria-label="Name"
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="you@example.com"
            aria-label="Email"
            type="email"
          />
        </label>

        <button onClick={save} style={styles.btn}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

const styles = {
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    padding: 32,
    borderRadius: 10,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  h3: {
    marginBottom: 20,
    color: "#4f46e5",
    fontSize: 22,
  },
  label: {
    display: "block",
    marginBottom: 16,
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    marginTop: 6,
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    width: "100%",
    fontSize: 16,
  },
  btn: {
    marginTop: 20,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 16,
    transition: "background-color 0.3s ease",
  },
  msg: {
    color: "#16a34a",
    fontWeight: 600,
    marginBottom: 16,
  },
};
