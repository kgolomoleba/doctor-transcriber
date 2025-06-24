const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function transcribe() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('./test-audio.mp3'));
  formData.append('model', 'whisper-1');

  try {
    const res = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    console.log('Transcript:', res.data.text);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

transcribe();