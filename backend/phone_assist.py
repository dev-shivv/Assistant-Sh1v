import requests

def send_command(cmds):
    cmd = f"{cmds}"
    try:
        r = requests.post("http://PHONE_IP:5005/command", 
                          json={"command": cmd}, timeout=3)
                          
        req = r.json()
        chat = f"Okay Sir,\nYour query for \"{cmd}\" on your phone is completed."
                          
        return req, chat
        
    except Exception as e:    
        req = str(e)
        chat = f"I'm currently unable to communicate with your Mobile device. Make sure the connection is established properly, and IP you entered is coorect with the script \"targeted_devive\" running on your device.\nThank you!"
        return req, chat