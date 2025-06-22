# 🩺 Doctor Transcriber

**Doctor Transcriber** is an AI-powered system that helps medical professionals capture, transcribe, and summarize doctor–patient conversations into structured SOAP notes. It uses audio input, OpenAI Whisper for transcription, large language models (LLMs) for summarization, and Supabase for secure data storage.

---

## ✅ Key Features

- 🎙️ **Record or Upload Audio** – Easily record live conversations or upload audio files.
- 🧠 **AI Transcription with Whisper** – Converts speech to accurate medical text.
- ✍️ **SOAP Note Summarization** – Summarizes transcripts using a clinical format:
  - **Subjective**: Patient symptoms  
  - **Objective**: Doctor’s observations  
  - **Assessment**: Diagnosis  
  - **Plan**: Treatment or next steps
- 💾 **Supabase Integration** – Stores all consultations securely in the cloud.
- 🔄 **n8n Automation** – Handles the workflow from audio input to SOAP generation.
- 🏥 **Optional EHR Export** – Integrates with electronic health records (EHR) systems like FHIR or OpenMRS.

---

## 🛠️ Tech Stack

| Component      | Technology                        |
|----------------|------------------------------------|
| Frontend       | React.js / HTML + JS              |
| Automation     | [n8n](https://n8n.io)             |
| Transcription  | OpenAI Whisper API                |
| Summarization  | GPT-4 / Claude                    |
| Database       | [Supabase](https://supabase.com)  |
| EHR Integration| FHIR / OpenMRS (optional)         |
