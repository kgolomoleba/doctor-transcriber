import os
from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
import uuid
from flask_cors import CORS

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/add_note", methods=["POST"])
def add_note():
    try:
        data = request.json
        note = {
            "doctor_id": str(uuid.uuid4()),
            "patient_id": str(uuid.uuid4()),
            "audio_url": data.get("audio_url", ""),
            "transcript": data.get("transcript", ""),
            "summary": data.get("summary", ""),
            "subjective": data.get("subjective", ""),
            "objective": data.get("objective", ""),
            "assessment": data.get("assessment", ""),
            "plan": data.get("plan", ""),
        }
        result = supabase.table("consult_notes").insert(note).execute()
        return jsonify(result.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/notes", methods=["GET"])
def get_notes():
    try:
        result = supabase.table("consult_notes").select("*").execute()
        return jsonify(result.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)