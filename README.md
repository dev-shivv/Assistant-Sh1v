# 🚀 Sh1v AI Assistant

A high-performance, full-stack AI assistant environment. Built with a lightning-fast Python backend and a premium frontend, Sh1v operates as a seamless Progressive Web App (PWA) capable of real-time system monitoring, persistent AI conversations, and heavy graphical rendering without dropping frames.

## ✨ Features

### 🤖 AI & Core Logic
* **Smart Conversational Matrix:** Integrated directly with the Groq API (`llama-3.1-8b-instant`) for ultra-low latency responses.
* **Persistent Memory:** The backend retains conversation history across sessions so the AI always has your context.
* **Dual Execution Modes:** A toggleable network matrix to seamlessly switch between cloud AI processing (Hybrid) and local system commands (Offline).
* **Voice & TTS Integration:** Built-in microphone hooks and voice-visualizer overlays for hands-free command execution.

### 🎨 UI & Dashboard Aesthetics
* **Hardware-Accelerated Glassmorphism:** The interface uses true physical glass effects—translucent panels, calculated edge bevels, and inset shadows that blur the background dynamically.
* **Fluid Ambient Render Engine:** A completely decoupled HTML5 Canvas engine runs in the background, pushing massive, slow-moving fluid light pools (cyan, purple, blue) without throttling device hardware.
* **Custom Profile & Settings Deck:** Built-in modal for updating your operator name, role, and avatar, plus toggles to control background rendering modes and frame-rate caps.
* **Grid-Locked Chassis:** Flexbox and CSS Grid layouts are mathematically locked down inside a master wrapper to prevent UI collapsing across different screen sizes.

### ⚙️ System Telemetry
* **Real-Time Diagnostics:** Live polling architecture feeds your hardware stats directly into the dashboard.
* **Visual Data Rings:** Custom animated UI rings and progress bars tracking live CPU load, RAM percentage, used memory, and total system uptime.

### 📱 Architecture & Deployment
* **Progressive Web App (PWA):** Fully installable as a native app via Service Workers and a Web Manifest. Runs full-screen with zero browser chrome.
* **Decoupled Logic:** Strict separation of concerns. UI rendering, API polling, and background canvas graphics all run on their own isolated JavaScript files to prevent memory leaks.

## 🛠️ Built With

* **Backend:** Python, FastAPI, Uvicorn 
* **AI Integration:** Groq API SDK
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6)
* **Graphics:** Native HTML5 Canvas 2D
* **Deployment:** Service Workers, Web Manifest (PWA)

---

## 📁 Project Structure

```text
app/
├── app.py                     # Main Python server, hardware polling, and Groq API bridge
└── frontend/
    ├── index.html             # Master layout and app wrapper
    ├── manifest.json          # PWA standalone configuration
    ├── sw.js                  # Background service worker
    └── static/
        ├── style.css          # Glassmorphism themes and grid styling
        ├── core.js            # Handles chat, buttons, and telemetry updates
        ├── render.js          # Hardware-accelerated fluid lighting background
        ├── voice.js           # Voice input overlay and TTS logic
        └── assets/            # System icons and local imagery
