alert("API is running")
/* =========================================================
   js4-api.js
   Owns ALL communication with the Python backend.
   js3-events.js calls these three functions; this file calls
   back into js2-render.js's render/append helpers. No backend
   URLs or fetch/WebSocket code exists anywhere else.

   Expected backend contract:
   - POST /chat     { message }  -> streamed plain-text reply
   - POST /command  { command }  -> streamed plain-text reply
                                     (top search bar / direct commands)
   - POST /action   { action }   -> fire-and-forget (Optimize Now etc.)
   - WS   /ws/terminal           -> backend pushes JSON line objects,
                                     shape matches state.terminalLog entries
                                     e.g. {"type":"data","text":"matched: open_yt (0.91)"}
   ========================================================= */

// Same origin by default. If FastAPI runs elsewhere (e.g. testing from
// another device on your network), set this to "http://<ip>:8000" instead.
const API_BASE = "http://127.0.0.1:8000";

/* ---------- Bottom chat input → POST /chat ----------
   Your backend currently replies with one full JSON object:
   { "response": "..." } — so this just awaits it and drops
   the whole answer into the bubble in one go.

   When you wire up Groq's StreamingResponse later, swap the
   body of this function for the streamIntoBubble() call used
   by sendCommandToBackend below — same assistantId pattern,
   just reads token-by-token instead of one .json() call. */
async function sendChatToBackend(text) {
  const assistantId = `m${Date.now()}`;
  addChatMessage({
    id: assistantId,
    sender: "assistant",
    name: "Sh1V",
    time: currentTime(),
    type: "text",
    content: ""
  });

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      appendAssistantToken(assistantId, "[Error reaching backend]");
      return;
    }

    const data = await response.json();
    appendAssistantToken(assistantId, data.response ?? "[Empty response from backend]");
  } catch (err) {
    console.error("Chat request failed:", err);
    appendAssistantToken(assistantId, "[Connection lost — is the backend running?]");
  }
}

/* ---------- Top search bar → POST /command (streamed) ---------- */
async function sendCommandToBackend(text) {
  const assistantId = `m${Date.now()}`;
  addChatMessage({
    id: assistantId,
    sender: "assistant",
    name: "Sh1V",
    time: currentTime(),
    type: "text",
    content: ""
  });

  await streamIntoBubble(`${API_BASE}/command`, { command: text }, assistantId);
}

/* ---------- Shared streaming logic for /chat and /command ---------- */
async function streamIntoBubble(url, body, assistantId) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok || !response.body) {
      appendAssistantToken(assistantId, "[Error reaching backend]");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      appendAssistantToken(assistantId, decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    console.error("Backend request failed:", err);
    appendAssistantToken(assistantId, "[Connection lost — is the backend running?]");
  }
}

/* ---------- Optimize Now / Show Details buttons → POST /action ---------- */
async function notifyBackendAction(actionId) {
  try {
    await fetch(`${API_BASE}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionId })
    });
    // No reply handled here on purpose — the backend reports what it did
    // through the /ws/terminal feed, same as any other action it takes.
  } catch (err) {
    console.error("Action request failed:", err);
    appendTerminalLine({ type: "data", text: `[action "${actionId}" failed — backend unreachable]` });
  }
}

/* ---------- Terminal: persistent live WebSocket feed ---------- */
let terminalSocket = null;

function connectTerminalSocket() {
  const base = API_BASE || window.location.origin;
  const wsUrl = base.replace(/^http/, "ws") + "/ws/terminal";

  terminalSocket = new WebSocket(wsUrl);

  terminalSocket.onopen = () => {
    appendTerminalLine({ type: "success", text: "[✓] Connected to backend" });
  };

  terminalSocket.onmessage = (event) => {
    try {
      appendTerminalLine(JSON.parse(event.data));
    } catch (err) {
      appendTerminalLine({ type: "data", text: event.data }); // plain text fallback
    }
  };

  terminalSocket.onclose = () => {
    appendTerminalLine({ type: "data", text: "[connection closed — retrying in 3s]" });
    setTimeout(connectTerminalSocket, 3000);
  };

  terminalSocket.onerror = () => {
    terminalSocket.close();
  };
}

document.addEventListener("DOMContentLoaded", connectTerminalSocket);