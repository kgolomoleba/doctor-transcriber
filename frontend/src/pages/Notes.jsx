/* Notes.jsx – full file */
import React, { useEffect, useState, useMemo } from "react";
import Skeleton from "../components/Skeleton";  // keep just one import of Skeleton
import { API } from "../doctorTheme";           // keep just one import of API

import {
  FaRegClock,
  FaTag,
  FaRegCopy,
  FaTrashAlt,
  FaRegStickyNote,
  FaFilePdf,
  FaEdit,
  FaPlus,
  FaTimes,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

const PAGE = 5;

export default function Notes() {
  /* ------------ state ------------ */
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);

  /* ------------ fetch ------------ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/notes`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNotes(data);
      } catch {
        toast.error("Could not fetch notes");
        setError("Failed to fetch notes");
      }
      setLoading(false);
    })();
  }, []);

  /* ------------ tag calc ------------ */
  const allTags = useMemo(() => {
    return Array.from(
      new Set(notes.flatMap((n) => n.tags || ["General"]))
    ).sort();
  }, [notes]);

  const tagColors = useMemo(() => {
    const palette = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#6366f1",
      "#d946ef",
      "#14b8a6",
      "#f97316",
    ];
    const map = {};
    allTags.forEach((t, i) => (map[t] = palette[i % palette.length]));
    return map;
  }, [allTags]);

  /* ------------ filter + pagination ------------ */
  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchText = `${n.summary} ${n.transcript}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchTag =
        tagFilter === "All" || (n.tags || []).includes(tagFilter);
      return matchText && matchTag;
    });
  }, [notes, search, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageNotes = filtered.slice((page - 1) * PAGE, page * PAGE);

  /* ------------ helpers ------------ */
  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
    document.getElementById("aria-status").textContent = "Transcript copied";
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const ok = await fetch(`${API}/notes/${id}`, { method: "DELETE" });
      if (!ok) throw new Error();
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Deleted");
      if (detail?.id === id) setDetail(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const pdf = (note) => {
    const doc = new jsPDF({ unit: "pt" });
    let y = 40;
    doc.setFontSize(18).text(`SOAP Note #${note.id}`, 40, y);
    y += 24;
    doc.setFontSize(12).text(`Date: ${new Date(note.created_at).toLocaleString()}`, 40, y);
    y += 30;
    ["subjective", "objective", "assessment", "plan"].forEach((sec) => {
      if (note[sec]) {
        doc.setFont(undefined, "bold").text(`${sec[0].toUpperCase() + sec.slice(1)}:`, 40, y);
        doc.setFont(undefined, "normal");
        const lines = doc.splitTextToSize(note[sec], 500);
        y += 16;
        doc.text(lines, 40, y);
        y += lines.length * 14 + 8;
      }
    });
    doc.save(`SOAP-Note-${note.id}.pdf`);
  };

  /* ------------ create / edit ------------ */
  const startCreate = () => {
    setCreating(true);
    setEditing({
      summary: "",
      transcript: "",
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      tagsText: "",
    });
    setDetail(null);
  };

  const startEdit = (n) => {
    setCreating(false);
    setEditing({ ...n, tagsText: (n.tags || []).join(", ") });
    setDetail(null);
  };

  const cancelEdit = () => setEditing(null);

  const handleEdit = (field, val) =>
    setEditing((prev) => ({ ...prev, [field]: val }));

  const saveEdit = async () => {
    if (!editing.summary && !editing.transcript) {
      toast.error("Summary or transcript required");
      return;
    }
    const isNew = creating;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? `${API}/notes` : `${API}/notes/${editing.id}`;
    const tagsArr = editing.tagsText
      ? editing.tagsText.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const body = { ...editing, tags: tagsArr };
    delete body.tagsText;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setNotes((prev) =>
        isNew ? [saved, ...prev] : prev.map((n) => (n.id === saved.id ? saved : n))
      );
      toast.success("Saved", { autoClose: 1500 });
      setEditing(null);
      setCreating(false);
      setPage(1);
    } catch {
      toast.error("Save failed");
    }
  };

  /* ------------ render ------------ */
  return (
    <div style={ui.wrap}>
      {/* ARIA status for screen readers */}
      <div
        id="aria-status"
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          left: -9999,
          height: 1,
          width: 1,
          overflow: "hidden",
        }}
      />
      {/* header / filters */}
      <header style={ui.head}>
        <h2 style={ui.h2}>
          <FaRegStickyNote /> SOAP Notes
        </h2>
        <div style={ui.controls}>
          <input
            className="input"
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={ui.input}
          />
          <select
            className="input"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            style={ui.input}
          >
            <option>All</option>
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button className="btnAccent" onClick={startCreate} style={ui.btn}>
            <FaPlus /> New
          </button>
        </div>
      </header>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {/* create / edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={ui.editCard}
          >
            <h3>
              {creating ? "New Note" : `Edit Note #${editing.id}`}
              <button
                onClick={cancelEdit}
                style={ui.closeBtn}
                aria-label="Cancel edit"
              >
                <FaTimes />
              </button>
            </h3>
            {["summary", "transcript", "subjective", "objective", "assessment", "plan"].map(
              (field) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={ui.label}>
                    {field[0].toUpperCase() + field.slice(1)}
                  </label>
                  <textarea
                    rows={field === "summary" ? 2 : 3}
                    className="input"
                    value={editing[field] || ""}
                    onChange={(e) => handleEdit(field, e.target.value)}
                    style={ui.textarea}
                  />
                </div>
              )
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={ui.label}>Tags (comma separated)</label>
              <input
                className="input"
                value={editing.tagsText}
                onChange={(e) => handleEdit("tagsText", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btnPrimary" onClick={saveEdit}>
                <FaSave /> Save
              </button>
              <button className="btnSecondary" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* detail view */}
      <AnimatePresence>
        {detail && !editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={ui.detailCard}
          >
            <h3>
              Note #{detail.id}
              <button
                onClick={() => setDetail(null)}
                style={ui.closeBtn}
                aria-label="Close detail"
              >
                <FaTimes />
              </button>
            </h3>
            <p style={ui.meta}>
              <FaRegClock /> {new Date(detail.created_at).toLocaleString()}
            </p>
            {["summary", "transcript", "subjective", "objective", "assessment", "plan"].map(
              (f) =>
                detail[f] && (
                  <section key={f} style={{ marginTop: 12 }}>
                    <h4 style={{ margin: "6px 0" }}>
                      {f[0].toUpperCase() + f.slice(1)}:
                    </h4>
                    <p style={{ whiteSpace: "pre-wrap" }}>{detail[f]}</p>
                  </section>
                )
            )}
            <h4 style={{ marginTop: 12 }}>Tags:</h4>
            <div style={ui.tagRow}>
              {(detail.tags || ["General"]).map((t) => (
                <span key={t} style={{ ...ui.tag, background: tagColors[t] }}>
                  <FaTag /> {t}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btnPrimary" onClick={() => startEdit(detail)}>
                <FaEdit /> Edit
              </button>
              <button className="btnDanger" onClick={() => remove(detail.id)}>
                <FaTrashAlt /> Delete
              </button>
              <button className="btnSecondary" onClick={() => pdf(detail)}>
                <FaFilePdf /> PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* notes grid */}
      <div aria-busy={loading} style={ui.grid}>
        {loading
          ? [...Array(PAGE)].map((_, i) => <Skeleton key={i} rows={6} />)
          : pageNotes.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                tabIndex={0}
                role="button"
                aria-label={`Open note #${n.id}`}
                style={ui.card}
                onClick={() => {
                  setDetail(n);
                  setEditing(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && setDetail(n)}
              >
                <div style={ui.metaSmall}>
                  #{n.id} • {new Date(n.created_at).toLocaleDateString()}
                </div>
                <p>{(n.summary || n.transcript).slice(0, 110)}…</p>
                <div style={ui.tagRow}>
                  {(n.tags || ["General"]).map((t) => (
                    <span key={t} style={{ ...ui.tag, background: tagColors[t] }}>
                      <FaTag /> {t}
                    </span>
                  ))}
                </div>
                <div style={ui.actions}>
                  <button
                    className="iBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(n.transcript);
                    }}
                    title="Copy transcript"
                  >
                    <FaRegCopy />
                  </button>
                  <button
                    className="iBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    title="Delete"
                  >
                    <FaTrashAlt color="#ef4444" />
                  </button>
                  <button
                    className="iBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      pdf(n);
                    }}
                    title="Export PDF"
                  >
                    <FaFilePdf color="#d9534f" />
                  </button>
                </div>
              </motion.div>
            ))}
        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b", gridColumn: "1/-1" }}>
            No notes match your search.
          </p>
        )}
      </div>

      {/* pager */}
      {filtered.length > PAGE && (
        <nav style={ui.pager}>
          <button
            className="btnSecondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FaChevronLeft /> Prev
          </button>
          <span style={{ alignSelf: "center" }}>
            Page {page} / {totalPages}
          </span>
          <button
            className="btnSecondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next <FaChevronRight />
          </button>
        </nav>
      )}
    </div>
  );
}

/* ------------ ui tokens ------------ */
const ui = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: 24 },
  head: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  h2: { display: "flex", gap: 6, alignItems: "center", color: "#4f46e5" },
  controls: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: { padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1" },
  btn: { display: "flex", gap: 6, alignItems: "center" },

  editCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,.06)",
    marginBottom: 20,
  },
  detailCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,.06)",
    marginBottom: 20,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    float: "right",
    fontSize: 18,
  },
  label: { fontWeight: 600, marginBottom: 4, display: "block" },
  textarea: { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #cbd5e1" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,.05)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  metaSmall: { fontSize: 13, color: "#6b7280" },
  tagRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  tag: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    fontSize: 12,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 8,
  },
  actions: { display: "flex", gap: 10, marginTop: "auto" },

  pager: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
  },
};
