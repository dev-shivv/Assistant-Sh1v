import os
import json
import random
import base64

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
CONSOLE_LOGS_FILE = os.path.join(os.path.dirname(__file__), "console_logs.json")
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "static", "assets")

def ensure_storage_exists():
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "w") as f:
            json.dump({
                "name": "Operator",
                "role": "Role: Sh1v Core",
                "avatar": "/static/assets/user-avatar.png",
                "bg_mode": "3d-particles"
            }, f, indent=4)
            
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w") as f:
            json.dump([], f)
            
    if not os.path.exists(CONSOLE_LOGS_FILE):
        with open(CONSOLE_LOGS_FILE, "w") as f:
            json.dump([
                "[SYSTEM] Console initialized.",
                "[INFO] Matrix connection pending..."
            ], f, indent=4)

ensure_storage_exists()

def get_telemetry_metrics():
    return {
        "cpu": random.randint(20, 55),
        "ram_percent": random.randint(50, 75),
        "ram_used": round(random.uniform(6.0, 7.5), 1),
        "disk_used": 230,
        "disk_total": 512,
        "uptime": "3d 14h 27m"
    }

def load_preferences_file():
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def update_profile_and_save_photo(data_dict: dict):
    if data_dict.get("avatar_base64"):
        try:
            header, encoded_str = data_dict["avatar_base64"].split(",", 1)
            raw_image_data = base64.b64decode(encoded_str)
            
            if not os.path.exists(ASSETS_DIR):
                os.makedirs(ASSETS_DIR)
            
            target_path = os.path.join(ASSETS_DIR, "user-avatar.png")
            with open(target_path, "wb") as f:
                f.write(raw_image_data)
                
            data_dict["avatar"] = "/static/assets/user-avatar.png"
            
        except Exception as e:
            raise Exception(f"Image preservation error: {str(e)}")
    
    data_dict.pop("avatar_base64", None)
    
    with open(CONFIG_FILE, "w") as f:
        json.dump(data_dict, f, indent=4)

def load_chat_history_file():
    with open(HISTORY_FILE, "r") as f:
        return json.load(f)

def append_to_chat_log(sender: str, text: str):
    with open(HISTORY_FILE, "r+") as f:
        data = json.load(f)
        data.append({"sender": sender, "text": text})
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()

def clear_history_on_disk():
    with open(HISTORY_FILE, "w") as f:
        json.dump([], f)

def load_console_logs_file():
    with open(CONSOLE_LOGS_FILE, "r") as f:
        return json.load(f)
