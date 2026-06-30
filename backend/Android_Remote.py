import requests
import json

# Replace this with your phone's actual IP. 
PHONE_IP = "ENTER_YOUR_PHONE  _IP"
PORT = 8080

def send_raw_command(raw_text: str):
    url = f"http://{PHONE_IP}:{PORT}"
    
    payload = {
        "command": raw_text
    }
    
    try:
        print(f"Sending: '{raw_text}'...")
        response = requests.post(url, json=payload, timeout=5.0)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Server Response: {json.dumps(result, indent=2)}")
            return result
        else:
            print(f"HTTP Error: {response.status_code}")
            return None
            
    except requests.exceptions.Timeout:
        print("[-] Error: Connection timed out. The phone did not respond in 5 seconds.")
    except requests.exceptions.ConnectionError:
        print(f"[-] Error: Could not connect to {PHONE_IP}. Is the Termux server running?")

if __name__ == "__main__":
    # Tests
    send_raw_command("turn off flash")
    
    #send_raw_command("search fast cars on youtube")
    
    #send_raw_command("hey could you open whatsapp please")
    
    #send_raw_command("search for completely unknown things")