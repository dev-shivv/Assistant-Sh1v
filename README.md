# 🚀 Sh1v AI Assistant

Sh1v is a high-performance, full-stack AI assistant designed to feel like a native desktop application. While it runs in the browser as a Progressive Web App (PWA), it is built to handle persistent AI conversations, real-time system monitoring, and heavy visual effects without slowing down your computer or dropping frames. 

## ✨ The Core Experience

### 🤖 Intelligent & Context-Aware
* **Lightning-Fast Brain:** Sh1v is wired directly into the `llama-3.1-8b-instant` model via the Groq API, meaning it processes questions and delivers answers with almost zero delay.
* **Persistent Memory:** The backend remembers your ongoing conversation across different sessions, so you never have to repeat yourself or start over from scratch when you reopen the app.
* **Adaptive Execution:** A built-in toggle lets you switch between "Hybrid" mode for complex cloud-based AI processing and an offline mode for executing local system commands.
* **Voice Control:** You can speak directly to Sh1v. It captures your voice, visualizes the audio in real-time, converts it to text, and reads its responses back to you.

### 🎨 Premium Interface
* **Physical Glass Aesthetics:** The dashboard doesn't just use flat colors; it replicates the look of frosted glass. Panels are translucent with carefully calculated edge bevels and shadows that dynamically blur whatever is behind them.
* **Fluid Light Engine:** A custom-built HTML5 Canvas engine runs quietly in the background, rendering massive, slow-moving pools of cyan, purple, and blue light without hogging your computer's resources.
* **Total Customization:** A dedicated settings menu allows you to change your operator name, swap out your avatar, and tweak how the background renders (including capping the frame rate to save power).
* **Unbreakable Layout:** The entire interface is mathematically locked into a CSS Grid. Whether you resize the window or open it on a different monitor, the layout will never break or collapse.

### ⚙️ Live System Monitoring
* **Hardware Telemetry:** The app constantly talks to your computer to pull live diagnostic data directly into the dashboard.
* **Visual Data Rings:** Custom animated progress bars and rings give you a real-time visual readout of your CPU load, available RAM, and exactly how long your system has been running.

### 📱 Under the Hood
* **App-Like Experience:** Because it is a Progressive Web App, you can install Sh1v directly to your system. It opens in its own full-screen window without standard browser search bars or tabs getting in the way.
* **Isolated Processes:** To ensure the app never crashes or leaks memory, the logic is strictly separated. The visual background, the user interface, and the backend data polling all run independently of one another.

## 🛠️ The Tech Stack

* **Backend Engine:** Python, FastAPI, Uvicorn 
* **AI Brain:** Groq API SDK
* **Frontend Visuals:** HTML5, CSS3, Vanilla JavaScript (ES6)
* **Background Graphics:** Native HTML5 Canvas 2D
* **App Deployment:** Service Workers, Web Manifest (PWA)

---

## 📁 Project Structure

```text
app/
├── app.py                     # Main server and routing bridge
├── backend/                   # Python helper modules
│   ├── engine .py             # Basically a brain of Application 
│   ├── GroqAPI.py             # Grok API communication and request handling
│   ├── phone_assist.py        # Remote Android connection and control handling
│   ├── actions.py             # Logic for opening apps and executing system command
│   ├── preserver.py.          # handles major saves of app
│   ├── playlist_yt.py.        # save our Playlist so that it can play it easily
│   └── log_handler.py         # System log handling (Work in Progress)
│
└── frontend/                  # Web Interface
    ├── index.html             # Master layout and app wrapper
    ├── manifest.json          # PWA standalone configuration
    ├── sw.js                  # Background service worker for app installation
    └── static/
        ├── style.css          # Glassmorphism themes and grid styling
        ├── core.js            # Handles chat, buttons, and telemetry updates
        ├── render.js          # Hardware-accelerated fluid lighting background
        ├── voice.js           # Voice input overlay and TTS logic
        └── assets/            # System icons and local imagery
