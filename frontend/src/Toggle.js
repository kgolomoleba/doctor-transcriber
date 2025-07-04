import React, { useEffect, useState } from "react";

export default function Toggle() {
  const [theme, setTheme] = useState(localStorage.theme || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.theme = theme;
  }, [theme]);

  return (
    <button
      className="iBtn"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle dark mode"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
// CSS for the toggle button