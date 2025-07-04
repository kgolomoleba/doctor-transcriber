import React from "react";

export default function StatsCard({ label, value, icon }) {
  return (
    <div className="statsCard">
      <div className="statsIcon">{icon}</div>
      <div>
        <div className="statsVal">{value}</div>
        <div className="statsLbl">{label}</div>
      </div>
    </div>
  );
}
StatsCard.defaultProps = {
  label: "Label",
  value: "0",
  icon: null,
};