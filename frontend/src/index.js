// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import App from "./App";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

// Mount the app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* ARIA live region for accessibility */}
    <div
      id="aria-status"
      aria-live="polite"
      style={{ position: "absolute", left: -9999 }}
    />

    <BrowserRouter>
      <App />
      {/* Toast notifications container */}
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  </React.StrictMode>
);
