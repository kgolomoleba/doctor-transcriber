import React from "react";
export default function GlassCard({ children, style }) {
  return (
    <div className="glassCard" style={style}>
      {children}
    </div>
  );
}
GlassCard.defaultProps = {
  style: {},
};