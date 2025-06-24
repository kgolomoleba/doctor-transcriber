const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (req, res) => {
  res.send('Doctor Transcriber backend is running!');
});

// Audio upload and transcription endpoint
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('model', 'whisper-1');

    const openaiRes = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return the transcript to frontend
    res.json({ transcript: openaiRes.data.text });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Transcription failed.' });
  }
});

// Summarization endpoint (SOAP note) with Supabase integration
app.post('/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required.' });
  }

  try {
    const prompt = `
Summarize the following doctor-patient conversation into a SOAP note:

${transcript}

Format:
Subjective:
Objective:
Assessment:
Plan:
`;

    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a medical scribe.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const summary = openaiRes.data.choices[0].message.content;

    // Save to Supabase
    const { error } = await supabase.from('consult_notes').insert([
      {
        transcript,
        summary
      }
    ]);
    if (error) {
      console.error('Supabase error:', error);
    }

    res.json({ summary });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Summarization failed.' });
  }
});

// Fetch all notes endpoint
app.get('/notes', async (req, res) => {
  const { data, error } = await supabase
    .from('consult_notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
