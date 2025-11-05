from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# --- Supabase Server-Side Client ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="CuraLink API")

# --- CORS Middleware ---
origins = ["*"] # Allow all
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Reusable HTTP client for external APIs ---
client = httpx.AsyncClient()

# --- Request Body Model for Favorites ---
class FavoriteRequest(BaseModel):
    user_id: str
    trial_id: str | None = None  # This is the string "NCT..." ID
    expert_id: str | None = None # This is the UUID for the expert

class QuestionRequest(BaseModel):
    user_id: str
    title: str
    question_body: str
    category: str

class ReplyRequest(BaseModel):
    user_id: str
    question_id: int
    reply_body: str

class TrialRequest(BaseModel):
    researcher_id: str
    title: str
    description: str
    eligibility_criteria: str
    phase: str
    status: str
    location: str
    ai_summary: str | None = None

# --- Root Endpoint ---
@app.get("/")
async def root():
    return {"message": "Welcome to the CuraLink API!"}


# --- Clinical Trials Endpoint ---
@app.get("/api/v1/trials/search")
async def search_trials(
    query: str = Query(..., description="Search query for conditions or keywords"),
    location: str = Query(None, description="Location to filter by (e.g., city, country)")
):
    CLINICAL_TRIALS_API_URL = "https://clinicaltrials.gov/api/v2/studies"
    try:
        params = {
            "query.cond": query,
            "fields": "NCTId,BriefTitle,OverallStatus,BriefSummary,LocationCity,LocationCountry",
            "format": "json",
            "pageSize": 20
        }
        if location:
            params["query.locn"] = location

        response = await client.get(CLINICAL_TRIALS_API_URL, params=params)
        response.raise_for_status() 
        data = response.json()
        
        processed_trials = []
        for trial in data.get("studies", []):
            study = trial.get("protocolSection", {})
            ai_summary = study.get("descriptionModule", {}).get("briefSummary", "No summary available.")
            locations = study.get("contactsLocationsModule", {}).get("locations", [])
            location_str = "Multiple locations"
            if locations:
                loc = locations[0]
                city = loc.get("city", "")
                country = loc.get("country", "")
                location_str = f"{city}, {country}".strip(", ")
            if not location_str:
                location_str = "Location not specified"

            processed_trials.append({
                "nctId": study.get("identificationModule", {}).get("nctId", "N/A"),
                "title": study.get("identificationModule", {}).get("briefTitle", "No title"),
                "status": study.get("statusModule", {}).get("overallStatus", "Unknown"),
                "summary": ai_summary,
                "location": location_str
            })
        return processed_trials
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error fetching data from ClinicalTrials.gov")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# --- Researchers Endpoint (Corrected) ---
@app.get("/api/v1/researchers/search")
def search_researchers(
    query: str = Query("", description="Search by name, specialty, or interest"),
    user_id: str = Query(..., description="The ID of the user who is searching")
):
    """
    Searches our 'profiles' table for registered researchers,
    EXCLUDING the user who is doing the search.
    """
    try:
        search_query = f"%{query}%" 

        response = supabase.from_("profiles") \
            .select("id, full_name, specialties, research_interests, available_for_meetings") \
            .eq("is_researcher", True) \
            .neq("id", user_id)\
            .or_(f"full_name.ilike.{search_query},specialties.ilike.{search_query},research_interests.ilike.{search_query}") \
            .limit(20) \
            .execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")
# --- Add Favorite Endpoint ---
@app.post("/api/v1/favorites/add")
def add_favorite(item: FavoriteRequest):
    try:
        insert_data = { "user_id": item.user_id }
        
        if item.trial_id:
            insert_data["trial_id_str"] = item.trial_id
        if item.expert_id:
            insert_data["expert_id"] = item.expert_id
        
        # Check for duplicates
        query = supabase.from_("favorites").select("id").match(insert_data)
        response = query.execute()

        if response.data:
            return {"message": "Item already in favorites"}

        # If not found, insert it
        response = supabase.from_("favorites").insert(insert_data).execute()
        
        if response.data:
            return {"message": "Favorite added!", "data": response.data}
        else:
            raise Exception("Failed to add favorite.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# --- Get Favorites Endpoint (THIS IS THE ONE THAT WAS 404) ---
# I have corrected the select query to be 100% valid
@app.get("/api/v1/favorites/{user_id}")
def get_favorites(user_id: str):
    """
    Gets all of a user's favorited items.
    """
    try:
        # The select query was the problem.
        # This is the correct way to join 'favorites' with 'profiles'
        # based on the foreign key 'expert_id'.
        # It renames the 'expert_id' object to 'expert' for the JSON.
        response = supabase.from_("favorites") \
            .select("""
                id,
                trial_id_str,
                expert:expert_id(id, full_name, specialties, research_interests)
            """) \
            .eq("user_id", user_id) \
            .execute()
        
        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")
    
# --- NEW ENDPOINT: Get All Forum Questions (with replies) ---
@app.get("/api/v1/forums/questions")
def get_forum_questions():
    """
    Gets all forum questions, joining with the user who asked
    and all replies (with the researchers who replied).
    """
    try:
        # This is a complex query to get questions, the patient's name,
        # and a list of all replies (with the researcher's name).
        response = supabase.from_("forum_questions") \
            .select("""
                id,
                title,
                question_body,
                category,
                created_at,
                patient:profiles(full_name),
                replies:forum_replies(
                    id,
                    reply_body,
                    created_at,
                    researcher:profiles(full_name)
                )
            """) \
            .order("created_at", desc=True) \
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# --- NEW ENDPOINT: Post a New Question (Patients) ---
@app.post("/api/v1/forums/questions")
def post_question(question: QuestionRequest):
    """
    Allows a user (patient) to post a new question.
    """
    try:
        response = supabase.from_("forum_questions") \
            .insert({
                "patient_id": question.user_id,
                "title": question.title,
                "question_body": question.question_body,
                "category": question.category
            }) \
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# --- NEW ENDPOINT: Post a New Reply (Researchers) ---
@app.post("/api/v1/forums/replies")
def post_reply(reply: ReplyRequest):
    """
    Allows a user (researcher) to post a reply to a question.
    """
    try:
        response = supabase.from_("forum_replies") \
            .insert({
                "researcher_id": reply.user_id,
                "question_id": reply.question_id,
                "reply_body": reply.reply_body
            }) \
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")
    
# --- NEW ENDPOINT: Get a Researcher's Own Trials ---
@app.get("/api/v1/trials/my-trials/{user_id}")
def get_my_trials(user_id: str):
    """
    Gets all clinical trials created by a specific researcher.
    """
    try:
        response = supabase.from_("clinical_trials") \
            .select("*") \
            .eq("researcher_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# --- NEW ENDPOINT: Post a New Clinical Trial ---
@app.post("/api/v1/trials")
def post_trial(trial: TrialRequest):
    """
    Allows a researcher to add a new clinical trial.
    """
    try:
        # We'll use the ai_summary from the request, 
        # or generate a simple one if not provided.
        summary = trial.ai_summary
        if not summary:
            summary = f"A Phase {trial.phase} trial for {trial.title}. Eligibility: {trial.eligibility_criteria}"

        response = supabase.from_("clinical_trials") \
            .insert({
                "researcher_id": trial.researcher_id,
                "title": trial.title,
                "description": trial.description,
                "eligibility_criteria": trial.eligibility_criteria,
                "phase": trial.phase,
                "status": trial.status,
                "location": trial.location,
                "ai_summary": summary
            }) \
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")