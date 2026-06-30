from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import urllib.parse
import re

PORT = 8080

def action(cmd, reply_msg):
    subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return reply_msg

COMMANDS = {
    "turn on flash": lambda: action("termux-torch on", "Flashlight is on. Lighting the way!"),
    "turn off flash": lambda: action("termux-torch off", "Flashlight is off. Back to darkness."),
    "wifi on": lambda: action("termux-wifi-enable true", "Wi-Fi enabled. Connecting to the world."),
    "wifi off": lambda: action("termux-wifi-enable false", "Wi-Fi disabled. Going offline."),
    
    "volume max": lambda: action("termux-volume music 15", "Volume set to maximum. Let's go!"),
    "volume up": lambda: action("termux-volume music 10", "Turned the volume up a bit."),
    "volume down": lambda: action("termux-volume music 5", "Turned the volume down. Nice and quiet."),
    "mute": lambda: action("termux-volume music 0", "Device muted. Absolute silence."),
    
    "brightness max": lambda: action("termux-brightness 255", "Screen is at full brightness."),
    "brightness normal": lambda: action("termux-brightness 128", "Screen brightness normalized."),
    "brightness low": lambda: action("termux-brightness 20", "Screen dimmed. Easy on the eyes."),

    "play music": lambda: action("termux-media-player play", "Resuming playback. Enjoy the tunes!"),
    "pause music": lambda: action("termux-media-player pause", "Media paused."),
    "next song": lambda: action("termux-media-player next", "Skipping to the next track."),
    "previous song": lambda: action("termux-media-player prev", "Going back to the last track."),
    
    "open youtube": lambda: action("am start -a android.intent.action.VIEW -d 'https://youtube.com'", "Opening YouTube. Happy watching!"),
    "open whatsapp": lambda: action("am start -n com.whatsapp/.HomeActivity", "Opening WhatsApp."),
    "open settings": lambda: action("am start -a android.settings.SETTINGS", "Opening device settings."),
    "open camera": lambda: action("am start -a android.media.action.IMAGE_CAPTURE", "Camera ready. Smile!"),
    "open maps": lambda: action("am start -a android.intent.action.VIEW -d 'geo:0,0'", "Opening Google Maps."),
    "open browser": lambda: action("am start -a android.intent.action.VIEW -d 'https://google.com'", "Opening the web browser."),
    "open calendar": lambda: action("am start -a android.intent.action.MAIN -c android.intent.category.APP_CALENDAR", "Here is your calendar."),
    "go home": lambda: action("am start -a android.intent.action.MAIN -c android.intent.category.HOME", "Taking you back to the home screen."),
    
    "good morning": lambda: action(
        "termux-brightness 150 && termux-volume music 10 && termux-tts-speak 'Good morning! Have a wonderful day.'", 
        "Morning routine activated. Have a great day!"
    ),
    "good night": lambda: action(
        "termux-brightness 0 && termux-volume music 0 && termux-tts-speak 'Good night. Rest well.'", 
        "Night routine activated. Sleep peacefully."
    ),
    "focus mode": lambda: action(
        "termux-volume music 0 && termux-volume ring 0", 
        "Focus mode on. All sounds muted. Get to work!"
    ),
    
    "battery status": lambda: action("termux-battery-status", "Checking battery status for you."),
    "ping": lambda: action("echo pong", "Connection is perfectly stable. I'm right here!")
}

DYNAMIC_COMMANDS = [
    (r"search\s+(.*?)\s+on\s+youtube", lambda q: action(
        f"am start -a android.intent.action.VIEW -d 'https://www.youtube.com/results?search_query={urllib.parse.quote(q)}'", 
        f"Opening YouTube to search for '{q}'. Enjoy!"
    )),
    (r"search\s+(.*?)\s+on\s+google", lambda q: action(
        f"am start -a android.intent.action.WEB_SEARCH --es query '{q}'", 
        f"Googling '{q}' right now."
    )),
    (r"find\s+(.*?)\s+on\s+maps", lambda q: action(
        f"am start -a android.intent.action.VIEW -d 'geo:0,0?q={urllib.parse.quote(q)}'", 
        f"Pulling up directions for '{q}'."
    )),
    
    (r"set\s+timer\s+for\s+(\d+)\s+minutes?", lambda q: action(
        f"am start -a android.intent.action.SET_TIMER --ei android.intent.extra.alarm.LENGTH {int(q)*60} --ez android.intent.extra.alarm.SKIP_UI true",
        f"Timer set for {q} minutes. I'll alert you when it's done!"
    )),
    (r"set\s+timer\s+for\s+(\d+)\s+seconds?", lambda q: action(
        f"am start -a android.intent.action.SET_TIMER --ei android.intent.extra.alarm.LENGTH {q} --ez android.intent.extra.alarm.SKIP_UI true",
        f"Quick timer set for {q} seconds."
    )),

    (r"(?:say|speak)\s+(.*)", lambda q: action(
        f"termux-tts-speak '{q}'", 
        f"I spoke your message: '{q}'"
    )),
    
    (r"dial\s+([0-9\+]+)", lambda q: action(
        f"am start -a android.intent.action.DIAL -d 'tel:{q}'", 
        f"Dialer opened for {q}. Just press call when ready."
    ))
]

def parse_and_execute(text: str):
    text = text.lower().strip()
    print(f"\n[+] Analyzing command: '{text}'")
    
    for pattern, action_func in DYNAMIC_COMMANDS:
        match = re.search(pattern, text)
        if match:
            query = match.group(1).strip()
            return action_func(query), "regex_match"

    if text in COMMANDS:
        return COMMANDS[text](), "exact_match"
        
    for key, action_func in COMMANDS.items():
        if key in text:
            return action_func(), "substring_match"
            
    return "I didn't understand that command. Could you try rephrasing?", None

class ThreadedRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            data = json.loads(post_data)
            raw_command = data.get("command", "")
            
            result, match_type = parse_and_execute(raw_command)
            
            if match_type:
                print(f"[+] Success ({match_type}): {result}")
                response = {"status": "success", "result": result}
            else:
                print(f"[-] Unrecognized command: {raw_command}")
                response = {"status": "error", "result": result}
                
        except Exception as e:
            print(f"[-] Server Error: {e}")
            response = {"status": "error", "result": "A system error occurred."}
            
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', PORT), ThreadedRequestHandler)
    print(f"Sh1v Enhanced Server listening securely on port {PORT}...")
    server.serve_forever()
