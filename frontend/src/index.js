// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // Correct: single Router wrapping App
import { ToastContainer } from "react-toastify";

import App from "./App";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ARIA live region for announcements */}
      <divd
        id="aria-status"
        aria-live="polite"
        style={{ position: "absolute", left: -9999 }}
      />

      <App />

      {/* Toast notifications */}
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  </React.StrictMode>
);
