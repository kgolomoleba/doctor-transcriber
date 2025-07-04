// src/pages/Recorder.jsx – Neo‑Glass Recorder (Jul 2025)

import React, { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaSave,
  FaFileAudio,
} from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useUser } from "../UserContext";

/* ---------------- helpers ---------------- */
const css = (v, d) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(v) || d
    : d;

const COLORS = {
  PRI: css("--primary", "#6366f1"),
  ACC: css("--accent", "#10b981"),
  DNG: css("--danger", "#ef4444"),
  TXT: css("--txt", "#1e293b"),
  SOFT: css("--txt-soft", "#475569"),
  CARD: css("--card", "#ffffff"),
  BORDER: css("--border", "#e2e8f0"),
};

/* ---------------- page ------------------ */
export default function Recorder() {
  const { user } = useUser();
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);            // seconds
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);      // 0‑100
  const [uploading, setUploading] = useState(false);

  const chunksRef = useRef([]);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  /* ---------- recording flow ---------- */
  const startRec = async () => {
    try {
      setStatus("Requesting microphone…");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const outFile = new File([blob], `rec-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setFile(outFile);
        setAudioURL(URL.createObjectURL(blob));
        setStatus("Recording finished ✔︎  —  ready to upload!");
        setRecording(false);
        setTimer(0);
      };

      rec.start();
      setRecording(true);
      setStatus("Recording…");

      // start timer
      timerRef.current = setInterval(
        () => setTimer((t) => t + 1),
        1000
      );
    } catch (err) {
      setStatus("🎙️ Microphone denied — please allow access.");
      console.error(err);
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  /* ---------- manual file pick ---------- */
  const handleChoose = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setAudioURL(URL.createObjectURL(f));
      setStatus("File selected — ready to upload!");
    }
  };

  /* ---------- upload ---------- */
  const upload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    setStatus("Uploading…");

    try {
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("audio")
        .upload(path, file, {
          contentType: file.type,
          // progress callback (supabase-js v2+)
          onUploadProgress: (e) =>
            setProgress(Math.round((e.loaded / e.total) * 100)),
        });

      if (upErr) throw upErr;

      await supabase.from("consult_notes").insert({
        doctor_id: user.id,
        audio_url: path,
      });

      setStatus("✅ Upload complete – see it in Notes!");
      setFile(null);
      setAudioURL("");
    } catch (e) {
      setStatus("❌ Upload failed: " + e.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /* ---------- cleanup on unmount ---------- */
  useEffect(() => () => stopRec(), []);

  /* ---------- ui ---------- */
  return (
    <section style={ui.wrap}>
      <h2 style={ui.h2}>
        <FaFileAudio /> AI Recorder
      </h2>

      {/* live waveform placeholder could go here */}

      {/* mic controls */}
      <div style={ui.row}>
        {recording ? (
          <button style={ui.btnDanger} onClick={stopRec} aria-label="Stop">
            <FaStop /> Stop {formatTime(timer)}
          </button>
        ) : (
          <button
            style={ui.btnAccent}
            onClick={startRec}
            disabled={uploading}
            aria-label="Start recording"
          >
            <FaMicrophone /> Record
          </button>
        )}
      </div>

      {/* manual file chooser */}
      <div style={ui.row}>
        <input
          id="audioFile"
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={handleChoose}
          disabled={uploading || recording}
        />
        <label htmlFor="audioFile" style={ui.btnPrimary}>
          <FaUpload /> Choose audio
        </label>
        {file && (
          <span style={ui.fileName} title={file.name}>
            {file.name}
          </span>
        )}
      </div>

      {/* upload button */}
      <button
        style={{ ...ui.btnAccent, opacity: !file || uploading ? 0.6 : 1 }}
        onClick={upload}
        disabled={!file || uploading}
      >
        <FaSave />
        {uploading ? `Uploading ${progress}%…` : "Upload"}
      </button>

      {/* progress bar */}
      {uploading && (
        <div style={ui.barWrap}>
          <div style={{ ...ui.bar, width: `${progress}%` }} />
        </div>
      )}

      {/* status */}
      {status && (
        <p
          style={{
            ...ui.status,
            color: status.startsWith("✅")
              ? COLORS.ACC
              : status.startsWith("❌")
              ? COLORS.DNG
              : COLORS.SOFT,
          }}
        >
          {status}
        </p>
      )}

      {/* preview */}
      {audioURL && (
        <audio
          controls
          src={audioURL}
          style={{ width: "100%", marginTop: 20, borderRadius: 8 }}
        />
      )}
    </section>
  );
}

/* ------------- helpers ------------- */
const formatTime = (s) =>
  new Date(s * 1000).toISOString().substring(14, 19); // mm:ss

/* ------------- styles --------------- */
const ui = {
  wrap: {
    maxWidth: 700,
    margin: "0 auto",
    padding: 32,
    background: "var(--glass, rgba(255,255,255,.82))",
    backdropFilter: "var(--glass-blur,blur(12px))",
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  h2: {
    margin: 0,
    fontSize: 24,
    color: COLORS.PRI,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
  },
  row: { display: "flex", alignItems: "center", gap: 14 },
  fileName: {
    fontSize: 14,
    color: COLORS.SOFT,
    maxWidth: 340,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  status: { fontWeight: 600, fontSize: 15 },
  barWrap: {
    width: "100%",
    height: 6,
    background: COLORS.BORDER,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  bar: {
    height: "100%",
    background: COLORS.ACC,
    transition: "width .2s linear",
  },

  /* buttons */
  btnBase: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 22px",
    fontWeight: 700,
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 15,
    transition: "transform .15s",
  },
  btnPrimary: {
    background: COLORS.PRI,
    color: "#fff",
    border: "none",
    padding: "12px 22px",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  btnAccent: {
    background: COLORS.ACC,
    color: "#fff",
    padding: "12px 26px",
    border: "none",
    borderRadius: 18,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 6px 18px rgba(16,185,129,.35)",
  },
  btnDanger: {
    background: COLORS.DNG,
    color: "#fff",
    padding: "12px 26px",
    border: "none",
    borderRadius: 18,
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 6px 18px rgba(239,68,68,.35)",
  },
};
