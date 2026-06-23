import difflib
from typing import Optional, Any
import re
import backend.actions as ac
import backend.phone_assist as assist
#from backend.HCscript import HCS
from backend.log_handler import log_and_guard
import backend.groqAPI as agf 

class Parser:
    def __init__(self):

        
        self.command_list = [
            "open youtube", "play", "search", "open gemini", 
            "open claude", "open chatgpt", "open github", 
            "open spotify", "system info", "what time"
        ]
        
        self.PLAY = {"play", "listen", "hear", "playing"}
        self.OPEN = {"open", "launch", "start"}
        self.SEARCH = {"search", "find", "look up", "look for"}
        self.APPS = {"youtube", "chrome", "google", "discord","netflix", "jio hotstar", "spotify", "amazon_prime", "whatsapp", "instagram", "facebook", "x", "linkdn", "github", "reddit", "pintrest", "blender", "premier pro", "photoshop", "after effects", "minecraft", "chatgpt", "gemini", "claude", "grok" }
        self.FILLER_WORDS = {"can", "could", "you", "i", "please", "would", "want", "to", "me", "kindly", "on", "my", "phone", "for"}

    def _correct_typos(self, text: str) -> str:
        words = text.split()
        vocab = self.PLAY | self.OPEN | self.SEARCH | self.APPS
        corrected_words = []
        
        for word in words:
            if word in self.FILLER_WORDS:
                corrected_words.append(word)
                continue
                
            matches = difflib.get_close_matches(word, vocab, n=1, cutoff=0.8)
            corrected_words.append(matches[0] if matches else word)
            
        return " ".join(corrected_words)

    #@log_and_guard
    def parse(self, raw_text: str) -> Any:
        
        clean_text = raw_text.lower().strip()
        
        phone_assistance = re.search(r"(.+) on my phone", clean_text)
        if phone_assistance:
            cmd = phone_assistance.group(1)
            return assist.send_command(cmd)
        
        
        """hcs_match = difflib.get_close_matches(clean_text, self.command_list, n=1, cutoff=0.85)
        if hcs_match:
            matched_cmd = hcs_match[0].replace(" ", "_")
            hcs_func = getattr(HCS, matched_cmd, None)
            if callable(hcs_func):
                return hcs_func()"""

        corrected_text = self._correct_typos(clean_text)
        words = corrected_text.split()
        
        intent = next((w for w in words if w in (self.PLAY | self.OPEN | self.SEARCH)), None)
        platform = next((w for w in words if w in self.APPS), None)
 
        ignore_set = self.PLAY | self.OPEN | self.SEARCH | self.APPS | self.FILLER_WORDS
        query_words = [w for w in words if w not in ignore_set]
        query = " ".join(query_words).strip() or None

        
        if intent and platform:
            term = f"{intent}_{platform}"
            
            
            if "phone" in clean_text:
                target_func = getattr(assist, term, None) or getattr(ac, term, None)
            else:
                target_func = getattr(ac, term, None) or getattr(assist, term, None)
            
            if callable(target_func):
                return target_func(query) #if query else target_func()
        
        
        """self.state= self.button.current_state
        if self.state == 0:
            return "Hey Sorry but ONLINE mode is under developement you may check out HYBRID for now."
        elif self.state ==1:
            return agf.ask_groq_fast(raw_text)
        else:
            return "Hey Sorry but OFFLINE mode is under developement you may check out HYBRID for now."""
        try:
            return "error"
        except Exception as e:
            return f"{e}"