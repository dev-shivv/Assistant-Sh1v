from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.engine import Parser
from fastapi import WebSocket, WebSocketDisconnect
import asyncio




app = FastAPI()
core = Parser()


app.mount("/static",StaticFiles(directory="frontend/static"), name="static")

@app.websocket("/ws/terminal")
async def terminal_socket(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")

    try:
        while True:
            await websocket.send_json({
                "type": "data",
                "text": "Backend is running..."
            })

            await asyncio.sleep(2)

    except WebSocketDisconnect:
        print("WebSocket disconnected")

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def home():
    return FileResponse("frontend/index.html")
    
@app.post("/chat")
async def chat(data: ChatRequest):
    print(f"{data.message}")
    result = core.parse(data.message)
    return {
            "response": f" {result}"
    }