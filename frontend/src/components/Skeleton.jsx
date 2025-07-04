import React from "react";

/**
 * Simple grey‑bar skeleton loader.
 * @param {number} rows – how many lines to show
 */
export default function Skeleton({ rows = 3 }) {
  return (
    <div style={{ padding: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 14,
            background: "#e5e7eb",
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
      ))}
    </div>
  );
}
