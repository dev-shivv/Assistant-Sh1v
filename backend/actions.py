import datetime
import os
import subprocess
import webbrowser
import psutil

# ==========================================
# 1.         SYSTEM
# ==========================================

def time_query():
    time = datetime.datetime.now().strftime("%I:%M:%S %p")
    return f"Current Time is: {time}"

def system_info():
    battery = psutil.sensors_battery()
    ram = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    
    battery_status = "Charging" if battery and battery.power_plugged else "Discharging"
    battery_percent = battery.percent if battery else "N/A"
    
    return f"""[——SYSTEM INFO——]
    Battery: {battery_percent}% ({battery_status})
    RAM: {ram.percent}% used
    CPU: {cpu}%"""

def play_youtube(query_youtube=None):
    if not query_youtube:
        return open_youtube()
    url = f"https://www.youtube.com/results?search_query={query_youtube}"
    webbrowser.open(url)
    return f"[SUCCESS] Opened YouTube For Query: {query_youtube}", f"Sure Sir,\nI've opened YouTube and searched {query_youtube} for you."

def search_google(query_web=None):
    if not query_web:
        webbrowser.open("https://www.google.com/")
        return "[SUCCESS] Opened Google [no query given]", "Sure Sir,\nI've opened Google for you."
    url = f"https://www.google.com/search?q={query_web}"
    webbrowser.open(url)
    return f"[SUCCESS] Opened Google For Query: {query_web}", f"Sure Sir,\nI've opened Google and searched {query_web} for you."


# ==========================================
# 2.    ooen url and apps
# ==========================================

def _open_web_app(url, app_name):
    webbrowser.open(url)
    return f"[SUCCESS] Opened {app_name}", f"Sure Sir,\nI've opened {app_name} for you."

def _open_local_app(exe_path, app_name):
    try:
        os.startfile(exe_path)
        return f"[SUCCESS] Opened {app_name}", f"Sure Sir,\nI've opened {app_name} for you."
    except FileNotFoundError:
        return f"[ERROR] Could not find path for {app_name}", f"Sorry Sir, I couldn't find the installation path for {app_name}."


# ==========================================
# 3.     web and os level apps
# ==========================================

# --- Web Apps ---
def open_youtube(query=None): return _open_web_app("https://www.youtube.com/", "YouTube")
def open_chatgpt(query=None): return _open_web_app("https://chatgpt.com/", "ChatGPT")
def open_gemini(query=None):  return _open_web_app("https://gemini.google.com/", "Gemini")
def open_claude(query=None):  return _open_web_app("https://www.claude.ai/", "Claude")
def open_github(query=None):  return _open_web_app("https://github.com/dev-shivv/Assistant-Framework.git", "GitHub")
def open_spotify(query=None): return _open_web_app("https://open.spotify.com/", "Spotify")
def open_netflix(query=None): return _open_web_app("https://www.netflix.com/", "Netflix")
def open_linkdn(query=None): return _open_web_app("https://www.linkdn.com/", "Linkdn")
def open_instagram(query=None): return _open_web_app("https://www.instagram.com/", "Instagram")
def open_facebook(query=None): return _open_web_app("https://www.facebook.com/", "facebook")
def open_gmail(query=None): return _open_web_app("https://www.gmail.com/", "Gmail")


# --- Local OS Apps  ---
def open_blender(query=None):      return _open_local_app(r"C:\Program Files\Blender Foundation\Blender\blender.exe", "Blender")
def open_premier_pro(query=None):  return _open_local_app(r"C:\Program Files\Adobe\Adobe Premiere Pro\Premiere.exe", "Premiere Pro")
def open_photoshop(query=None):    return _open_local_app(r"C:\Program Files\Adobe\Adobe Photoshop\Photoshop.exe", "Photoshop")
def open_minecraft(query=None):    return _open_local_app(r"C:\XboxGames\Minecraft\Minecraft.exe", "Minecraft")
