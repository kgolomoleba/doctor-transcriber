import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

# Load .env variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Try to fetch data from a table
response = supabase.table("consult_notes").select("*").limit(1).execute()
print(response.data)

# Insert a test record (use UUIDs!)
test_note = {
    "doctor_id": str(uuid.uuid4()),
    "patient_id": str(uuid.uuid4()),
    "audio_url": "https://example.com/audio.mp3",
    "transcript": "Patient presents with cough and fever.",
    "summary": "SOAP summary here.",
    "subjective": "Patient reports cough and fever.",
    "objective": "Vitals stable.",
    "assessment": "Likely viral infection.",
    "plan": "Supportive care.",
    # created_at and updated_at can be omitted if Supabase auto-generates them
}

insert_response = supabase.table("consult_notes").insert(test_note).execute()
print("Inserted:", insert_response.data)

# Fetch all records
all_notes = supabase.table("consult_notes").select("*").execute()
print("All notes:", all_notes.data)