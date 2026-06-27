/* ==========================================
   FILE: frontend/static/voice.js
   PURPOSE: Echo-Canceling Loop, Hinglish TTS & Kill Switch
   ========================================== */

let voiceLoopActive = false; 
let recognitionInstance = null;

function speakMatrixPayload(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    let phoneticText = text;
    const hinglishMap = [
        { raw: /\bmain\b/gi, phonetic: "maayn" },
        { raw: /\btheek\b/gi, phonetic: "theek" },
        { raw: /\bhoon\b/gi, phonetic: "huun" },
        { raw: /\bhai\b/gi, phonetic: "haye" }
    ];
    hinglishMap.forEach(item => phoneticText = phoneticText.replace(item.raw, item.phonetic));

    const utterance = new SpeechSynthesisUtterance(phoneticText);
    const voices = window.speechSynthesis.getVoices();
    const tacticalVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('IN'));
    
    if (tacticalVoice) utterance.voice = tacticalVoice;
    else utterance.lang = 'en-IN'; 
    
    utterance.rate = 0.98; 
    utterance.pitch = 1.0; 
    
    // ECHO LOOP FIX: Force a hard 800ms delay after TTS ends before opening mic
    utterance.onend = () => {
        console.log("[TTS] Audio output complete. Initializing dead-zone debounce.");
        if (voiceLoopActive && recognitionInstance) {
            setTimeout(() => {
                if (voiceLoopActive && !window.speechSynthesis.speaking) {
                    try {
                        recognitionInstance.start();
                        console.log("[LOOP] Mic re-engaged.");
                    } catch (err) {}
                }
            }, 800); // 800 millisecond safety buffer
        }
    };

    utterance.onerror = () => {
        if (voiceLoopActive && recognitionInstance) {
            setTimeout(() => recognitionInstance.start(), 800);
        }
    };
    
    window.speechSynthesis.speak(utterance);
}

if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    if (!micBtn) return;

    // --- NEW: OVERLAY KILL SWITCH ---
    const closeVoiceBtn = document.getElementById('btn-close-voice');
    if (closeVoiceBtn) {
        closeVoiceBtn.addEventListener('click', () => {
            voiceLoopActive = false; // Kill the continuous loop
            
            // Reset the main mic button UI
            micBtn.style.boxShadow = "none";
            micBtn.style.borderColor = "rgba(255,255,255,0.1)";
            
            try {
                recognitionInstance.stop(); // Stop listening
                window.speechSynthesis.cancel(); // Stop talking
            } catch (err) {}
            
            // Hide the overlay immediately
            document.getElementById('voice-overlay').classList.add('hidden');
            console.log("[STT] Voice loop terminated via manual override.");
        });
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-IN'; 
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    micBtn.addEventListener('click', () => {
        if (!voiceLoopActive) {
            voiceLoopActive = true;
            micBtn.style.boxShadow = "0 0 20px var(--neon-purple)";
            micBtn.style.borderColor = "var(--neon-purple)";
            try { recognitionInstance.start(); } catch (err) {}
        } else {
            voiceLoopActive = false;
            micBtn.style.boxShadow = "none";
            micBtn.style.borderColor = "rgba(255,255,255,0.1)";
            try { 
                recognitionInstance.stop();
                window.speechSynthesis.cancel();
                document.getElementById('voice-overlay').classList.add('hidden');
            } catch (err) {}
        }
    });

    recognitionInstance.onstart = () => {
        if (micBtn) {
            micBtn.style.boxShadow = "0 0 20px var(--neon-cyan)";
            micBtn.style.borderColor = "var(--neon-cyan)";
        }
        document.getElementById('voice-overlay').classList.remove('hidden');
    };

    recognitionInstance.onresult = (event) => {
        const textResult = event.results[0][0].transcript;
        const chatInput = document.getElementById('chat-input');
        if (chatInput) chatInput.value = textResult;
        if (typeof window.executeChatMessage === 'function') window.executeChatMessage();
    };

    // ECHO LOOP FIX: Do not instantly restart if Sh1v is talking
    recognitionInstance.onend = () => {
        document.getElementById('voice-overlay').classList.add('hidden');
        
        // Only attempt to restart if the system is completely silent
        if (voiceLoopActive && !window.speechSynthesis.speaking) {
            setTimeout(() => {
                if (voiceLoopActive && !window.speechSynthesis.speaking) {
                    try { recognitionInstance.start(); } catch (err) {}
                }
            }, 800);
        } else if (!voiceLoopActive && micBtn) {
            micBtn.style.boxShadow = "none";
            micBtn.style.borderColor = "rgba(255,255,255,0.1)";
        }
    };
});
