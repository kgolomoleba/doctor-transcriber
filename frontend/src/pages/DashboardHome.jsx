// DashboardHome.jsx – AI Overview v2 (Revamped for July 2025)

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaHeartbeat,
  FaNotesMedical,
  FaRegCalendarCheck,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "../supabaseClient";
import { useUser } from "../UserContext";

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function DashboardHome() {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("consult_notes")
        .select("id, summary, transcript, created_at")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && isMounted) {
        setNotes(data || []);
        setStatus("ready");
      } else if (error && isMounted) {
        console.error(error);
        setStatus("error");
      }
    };

    fetchNotes();

    const subscription = supabase
      .from(`consult_notes:doctor_id=eq.${user.id}`)
      .on("INSERT", (payload) => {
        setNotes((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeSubscription(subscription);
    };
  }, [user]);

  const kpi = useMemo(() => {
    const result = {
      total: 0,
      last7: 0,
      avgWords: 0,
      trend: [],
      recent: [],
    };
    if (notes.length === 0) return result;

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);

    const byDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }

    let wordSum = 0;
    let last7 = 0;

    notes.forEach((n) => {
      const dKey = n.created_at.slice(0, 10);
      if (dKey in byDay) {
        byDay[dKey]++;
        last7++;
      }
      wordSum += (n.transcript || "").split(/\s+/).filter(Boolean).length;
    });

    result.total = notes.length;
    result.last7 = last7;
    result.avgWords = Math.round(wordSum / notes.length);
    result.trend = Object.entries(byDay).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
    result.recent = notes.slice(0, 4);

    return result;
  }, [notes]);

  return (
    <div style={ui.container}>
      <header style={ui.header}>
        <h2>
          Hello&nbsp;
          <strong>{user?.name || user?.email}</strong>
        </h2>
        <p style={ui.subtext}>Here’s a quick snapshot of your activity.</p>
      </header>

      <section style={ui.kpiRow}>
        {status === "loading" ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} />)
        ) : (
          <>
            <KPI icon={<FaNotesMedical />} label="Total Notes" value={kpi.total} />
            <KPI icon={<FaRegCalendarCheck />} label="Last 7 Days" value={kpi.last7} />
            <KPI icon={<FaHeartbeat />} label="Avg Words/Note" value={kpi.avgWords} />
            <button onClick={() => navigate("/recorder")} style={ui.cta}>
              <FaPlus /> New Recording
            </button>
          </>
        )}
      </section>

      <section style={ui.chartWrap}>
        <h3 style={ui.sectionHead}>Weekly Activity</h3>
        {status === "loading" ? (
          <Skeleton h={200} />
        ) : kpi.trend.length === 0 ? (
          <p style={ui.subtext}>No recent activity found.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kpi.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section style={ui.recentWrap}>
        <h3 style={ui.sectionHead}>Recent Consults</h3>
        {status === "loading" ? (
          <p style={ui.subtext}>Loading recent consults…</p>
        ) : kpi.recent.length === 0 ? (
          <p style={ui.subtext}>No consults available yet.</p>
        ) : (
          <ul style={ui.cardList}>
            {kpi.recent.map((n) => (
              <li
                key={n.id}
                style={ui.card}
                onClick={() => navigate(`/notes/${n.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/notes/${n.id}`);
                }}
              >
                <p style={ui.cardDate}>{formatDate(n.created_at)}</p>
                <p style={ui.cardText}>{n.summary || "(No summary available)"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KPI({ icon, label, value }) {
  return (
    <div style={ui.kpiBox}>
      <span style={ui.kpiIcon}>{icon}</span>
      <div>
        <p style={ui.kpiVal}>{value}</p>
        <p style={ui.kpiLabel}>{label}</p>
      </div>
    </div>
  );
}

function Skeleton({ h = 100 }) {
  return (
    <div
      style={{
        background: `linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)`,
        backgroundSize: `400% 100%`,
        animation: `skeleton 1.4s ease infinite`,
        borderRadius: 10,
        height: h,
        width: "100%",
      }}
    />
  );
}

const ui = {
  container: { padding: 24, maxWidth: 960, margin: "0 auto" },
  header: { marginBottom: 24 },
  subtext: { fontSize: 14, color: "var(--txt-soft)" },
  sectionHead: { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  kpiBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,.05)",
  },
  kpiIcon: { fontSize: 22, color: "var(--primary)" },
  kpiVal: { margin: 0, fontSize: 22, fontWeight: 800, color: "var(--primary)" },
  kpiLabel: { margin: 0, fontSize: 13, color: "var(--txt-soft)" },
  cta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    justifyContent: "center",
  },
  chartWrap: { marginTop: 40 },
  recentWrap: { marginTop: 48 },
  cardList: { listStyle: "none", padding: 0, display: "grid", gap: 16 },
  card: {
    background: "var(--glass)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 16,
    cursor: "pointer",
    transition: "transform 0.2s ease",
    outline: "none",
  },
  cardDate: { fontWeight: 600, fontSize: 13, color: "var(--primary)" },
  cardText: { marginTop: 4, fontSize: 14, color: "var(--txt-soft)" },
};

// Global CSS needed for skeleton animation:
// @keyframes skeleton {
//   0%   { background-position: -400px 0; }
//   100% { background-position: 400px 0; }
// }
