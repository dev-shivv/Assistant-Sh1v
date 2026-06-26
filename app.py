from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os


from backend import preserver
from backend.engine import Parser

app = FastAPI(title="Aissistant Sh1v", version="1.0.0")
parser = Parser()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "static")
HTML_FILE = os.path.join(BASE_DIR, "frontend", "index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

class ProfileUpdatePayload(BaseModel):
    name: str
    role: str
    avatar_base64: Optional[str] = None  
    bg_mode: str

class ChatPayload(BaseModel):
    message: str

@app.get("/")
async def serve_ui():
    return FileResponse(HTML_FILE)

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(payload: ChatMessage):
    print(f"[RX INCOMING] {payload.message}")
    
    result = parser.parse(payload.message)
    reply_text = f"{result}"
    
    return {"response": reply_text}


@app.get("/manifest.json")
async def get_manifest():
    return FileResponse("frontend/manifest.json")

@app.get("/sw.js")
async def get_sw():
    return FileResponse("frontend/static/sw.js")



@app.get("/api/sysinfo")
async def get_system_telemetry():
    return preserver.get_telemetry_metrics()

@app.get("/api/preferences")
async def load_preferences():
    return preserver.load_preferences_file()

@app.post("/api/profile/update")
async def update_profile(payload: ProfileUpdatePayload):
    try:
        preserver.update_profile_and_save_photo(payload.dict())
        return {"status": "success", "message": "Profile updated locally."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile preservation failure: {str(e)}")

@app.get("/api/chat/history")
async def get_chat_history():
    return preserver.load_chat_history_file()

@app.delete("/api/chat/clear")
async def clear_chat_history():
    preserver.clear_history_on_disk()
    return {"status": "cleared"}

@app.post("/api/chat-hybrid")
async def chat_hybrid_pipeline(payload: ChatPayload):
    user_msg = payload.message.strip()
    preserver.append_to_chat_log("user", user_msg)
    
    result = parser.parse(user_msg)
    console, chat = result
    ai_response = f"{chat}"
    
    preserver.append_to_chat_log("assistant", ai_response)
    return {"response": ai_response, "terminal": "Hybrid Processing [OK]"}

@app.post("/api/chat-offline")
async def chat_offline_pipeline(payload: ChatPayload):
    user_msg = payload.message.strip()
    preserver.append_to_chat_log("user", user_msg)
    
    ai_response = f"[OFFLINE] Local parser result for: '{user_msg}'"
    
    preserver.append_to_chat_log("assistant", ai_response)
    return {"response": ai_response, "terminal": "Local Parser [OK]"}

@app.get("/api/console/logs")
async def fetch_console_logs():
    return {"logs": preserver.load_console_logs_file()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)