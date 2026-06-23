import requests
from PySide6.QtCore import QThread, Signal, Slot
from signals import binder

class PhoneCommand(QThread):
    execution_done = Signal(dict, str)
    execution_failed = Signal(str)
    
    def __init__(self):
        super().__init__()
        #self.cmd_text = cmd_text
        
    def run(self, cmd_text):
        try:
            url = "http://10.87.170.174:5005/command"
            r = requests.post(url, json={"Command": cmd_text}, timeout=5)
            
            req = r.json()
            chat = f"Okay Sir,\nYour query for \"{cmd_text}\" is completed on the target device"
            
            self.execution_done.emit(req)
        except Exception as e:
            self.execution_failed.emit(str(e))
            
def send_command(cmds):
    global active_thread
    active_thread = PhoneCommand()
    active_thread.start()
    active_thread.run(cmds)
        