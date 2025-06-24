import React, { useState, useRef } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import './App.css';

const recorder = new MicRecorder({ bitRate: 128 });

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [notes, setNotes] = useState([]);

  const fileInputRef = useRef();

  const startRecording = () => {
    recorder
      .start()
      .then(() => setIsRecording(true))
      .catch((e) => showSnackbar(e.message));
  };

  const stopRecording = () => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const url = URL.createObjectURL(blob);
        setBlobURL(url);
        setIsRecording(false);
        setSelectedFile(new File([blob], "recording.mp3", { type: "audio/mp3" }));
        showSnackbar("Recording ready for upload!");
      })
      .catch((e) => showSnackbar(e.message));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setBlobURL("");
    setUploadStatus("");
    setTranscript("");
    setSummary("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("audio", selectedFile);

    setUploadStatus("Uploading...");
    setTranscript("");
    setSummary("");
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus("Upload successful!");
        setTranscript(data.transcript);
        showSnackbar("Transcription complete!");
      } else {
        setUploadStatus(data.error || "Upload failed.");
        showSnackbar(data.error || "Upload failed.");
      }
    } catch (err) {
      setUploadStatus("Upload failed.");
      showSnackbar("Upload failed.");
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;
    setSummarizing(true);
    setSummary("");
    try {
      const res = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        showSnackbar("SOAP note ready!");
      } else {
        setSummary(data.error || "Summarization failed.");
        showSnackbar(data.error || "Summarization failed.");
      }
    } catch (err) {
      setSummary("Summarization failed.");
      showSnackbar("Summarization failed.");
    }
    setSummarizing(false);
  };

  // --- NEW: Save note to backend ---
  const saveNoteToBackend = async () => {
    if (!transcript && !summary) {
      showSnackbar("No transcript or summary to save.");
      return;
    }
    const note = {
      audio_url: blobURL || "",
      transcript,
      summary,
      subjective: summary ? summary.split("Subjective:")[1]?.split("Objective:")[0]?.trim() || "" : "",
      objective: summary ? summary.split("Objective:")[1]?.split("Assessment:")[0]?.trim() || "" : "",
      assessment: summary ? summary.split("Assessment:")[1]?.split("Plan:")[0]?.trim() || "" : "",
      plan: summary ? summary.split("Plan:")[1]?.trim() || "" : "",
    };
    try {
      const res = await fetch("http://localhost:5000/add_note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (res.ok) {
        showSnackbar("Note saved to backend!");
        fetchNotesFromBackend();
      } else {
        showSnackbar("Failed to save note.");
      }
    } catch (err) {
      showSnackbar("Failed to save note.");
    }
  };

  // --- NEW: Fetch notes from backend ---
  const fetchNotesFromBackend = async () => {
    try {
      const res = await fetch("http://localhost:5000/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      showSnackbar("Failed to fetch notes.");
    }
  };

  // Optionally, fetch notes on mount
  // React.useEffect(() => { fetchNotesFromBackend(); }, []);

  const handleClear = () => {
    setBlobURL("");
    setSelectedFile(null);
    setUploadStatus("");
    setTranscript("");
    setSummary("");
    setSnackbar("");
  };

  const showSnackbar = (msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(""), 3000);
  };

  return (
    <>
      <div className="topbar">Doctor Transcriber</div>
      <div className="container">
        <header className="header">
          <h1 className="title">Doctor Transcriber</h1>
          <p className="subtitle">
            Secure, AI-powered medical voice transcription and SOAP note generation.
          </p>
        </header>

        <section className="section-card">
          <div className="section-title">1. Record or Upload Audio</div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`mic-btn${isRecording ? " recording" : ""}`}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 1 2 0 7 7 0 0 1-6 6.92V21h3a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h3v-2.08A7 7 0 0 1 4 12a1 1 0 1 1 2 0 5 5 0 0 0 10 0z"/>
              </svg>
            )}
          </button>
          <div className="upload-controls">
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              className="button upload"
              onClick={() => fileInputRef.current.click()}
              disabled={isRecording}
              type="button"
            >
              {selectedFile ? "Change Audio File" : "Select Audio File"}
            </button>
            <button
              onClick={handleUpload}
              className="button start"
              disabled={!selectedFile || isRecording}
              type="button"
            >
              ⬆️ Upload Audio
            </button>
            <button
              onClick={handleClear}
              className="button clear"
              disabled={isRecording || summarizing}
              type="button"
            >
              Clear
            </button>
          </div>
          {selectedFile && (
            <div className="file-info">
              <span>
                <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
          {uploadStatus && <div className="status">{uploadStatus}</div>}
        </section>

        {blobURL && (
          <>
            <hr className="section-divider" />
            <section className="section-card">
              <div className="section-title">2. Playback</div>
              <audio src={blobURL} controls className="audio-player" />
            </section>
          </>
        )}

        {transcript && (
          <>
            <hr className="section-divider" />
            <section className="section-card">
              <div className="section-title">3. Transcript</div>
              <div className="transcript">{transcript}</div>
              <button
                onClick={handleSummarize}
                className="button start"
                disabled={summarizing}
              >
                {summarizing ? "Summarizing..." : "Summarize as SOAP Note"}
              </button>
            </section>
          </>
        )}

        {summary && (
          <>
            <hr className="section-divider" />
            <section className="section-card">
              <div className="section-title">4. SOAP Note Summary</div>
              <div className="summary">{summary}</div>
              <button
                className="button upload"
                style={{ marginTop: 12 }}
                onClick={saveNoteToBackend}
              >
                Save Note to Backend
              </button>
            </section>
          </>
        )}

        {/* Show notes from backend */}
        {notes.length > 0 && (
          <>
            <hr className="section-divider" />
            <section className="section-card">
              <div className="section-title">Saved Notes (from Backend)</div>
              <pre style={{ textAlign: "left", width: "100%", overflowX: "auto" }}>
                {JSON.stringify(notes, null, 2)}
              </pre>
              <button className="button upload" onClick={fetchNotesFromBackend}>
                Refresh Notes
              </button>
            </section>
          </>
        )}

        {snackbar && <div className="snackbar">{snackbar}</div>}

        <footer>
          <small>
            © 2025 Doctor Transcriber. All rights reserved.<br />
            <a href="mailto:support@doctortranscriber.com" style={{color:'#1976d2', textDecoration:'none'}}>Contact Support</a>
          </small>
        </footer>
      </div>
    </>
  );
}