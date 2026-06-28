/* ==========================================
   FILE: frontend/static/core.js
   PURPOSE: Core UI Logic & API Handlers (RESTORED WITH VOICE & SETTINGS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    let currentNetworkMode = 'hybrid';
    let currentProfileConfig = null;   
    let base64ImageUploadString = null; 

    const rightPanel = document.getElementById('panel-right');
    const btnHideRight = document.getElementById('btn-hide-right');
    const btnShowRight = document.getElementById('btn-show-right');

    const tabTerminal = document.getElementById('tab-terminal');
    const tabConsole = document.getElementById('tab-console');
    const slider = document.getElementById('toggle-slider');
    const viewTerminal = document.getElementById('view-terminal');
    const viewConsole = document.getElementById('view-console');

    const btnHybrid = document.getElementById('btn-hybrid');
    const btnOffline = document.getElementById('btn-offline');

    const profileTriggerBar = document.getElementById('profile-trigger');
    const profileModal = document.getElementById('profile-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnUploadTrigger = document.getElementById('btn-upload-trigger');
    const hiddenFileInput = document.getElementById('file-upload');
    const modalAvatarPreview = document.querySelector('#modal-avatar-preview img');
    const editUsernameInput = document.getElementById('edit-username');
    const editRoleInput = document.getElementById('edit-role');
    const btnSaveProfile = document.getElementById('btn-save-profile');

    const globalAvatarImg = document.querySelector('#global-avatar-preview img');
    const profNameDisplay = document.getElementById('prof-name-display');
    const profRoleDisplay = document.getElementById('prof-role-display');

    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistoryContainer = document.getElementById('chat-history-container');
    const btnClearChat = document.getElementById('btn-clear-chat');

    const cpuRingVal = document.getElementById('cpu-ring-val');
    const ramPillVal = document.getElementById('ram-pill-val');
    const ramUsedPillVal = document.getElementById('ram-used-pill-val');
    const uptimePillVal = document.getElementById('uptime-pill-val');
    const cpuBarLabel = document.getElementById('cpu-bar-label');
    const cpuBarFill = document.getElementById('cpu-bar-fill');
    const ramBarLabel = document.getElementById('ram-bar-label');
    const ramBarFill = document.getElementById('ram-bar-fill');

    // --- NEW: SETTINGS DECK SELECTORS ---
    const bgModeSelect = document.getElementById('setting-bg-mode');
    const fpsCapSelect = document.getElementById('setting-fps-cap');

    async function initAppCore() {
        console.log("[SYSTEM] Sh1v Pipeline Initializing...");
        await loadPersistentPreferences();
        await loadMasterChatHistory();
        startTelemetryInstrumentation(); 
    }

    btnHideRight.addEventListener('click', () => {
        rightPanel.classList.add('collapsed-state');
        btnShowRight.classList.remove('hidden');
    });

    btnShowRight.addEventListener('click', () => {
        rightPanel.classList.remove('collapsed-state');
        btnShowRight.classList.add('hidden');
    });

    tabTerminal.addEventListener('click', () => {
        slider.classList.remove('slider-right');
        tabTerminal.classList.add('active');
        tabConsole.classList.remove('active');
        viewTerminal.classList.remove('hidden');
        viewConsole.classList.add('hidden');
    });

    tabConsole.addEventListener('click', () => {
        slider.classList.add('slider-right');
        tabConsole.classList.add('active');
        tabTerminal.classList.remove('active');
        viewConsole.classList.remove('hidden');
        viewTerminal.classList.add('hidden');
    });

    btnHybrid.addEventListener('click', () => {
        currentNetworkMode = 'hybrid';
        btnHybrid.classList.add('active');
        btnOffline.classList.remove('active');
    });

    btnOffline.addEventListener('click', () => {
        currentNetworkMode = 'offline';
        btnOffline.classList.add('active');
        btnHybrid.classList.remove('active');
    });

    // --- NEW: SETTINGS DECK LISTENERS ---
    if (bgModeSelect) {
        bgModeSelect.addEventListener('change', (e) => {
            appendConsoleFeedback(`[SYS] Background mode set to: ${e.target.value}`);
        });
    }

    if (fpsCapSelect) {
        fpsCapSelect.addEventListener('change', (e) => {
            appendConsoleFeedback(`[SYS] Engine FPS cap set to: ${e.target.value}`);
        });
    }

    profileTriggerBar.addEventListener('click', () => {
        if (!currentProfileConfig) return;
        editUsernameInput.value = currentProfileConfig.name;
        editRoleInput.value = currentProfileConfig.role.replace('Role: ', '');
        modalAvatarPreview.src = currentProfileConfig.avatar;
        base64ImageUploadString = null; 
        profileModal.classList.remove('hidden');
    });

    btnCloseModal.addEventListener('click', () => profileModal.classList.add('hidden'));

    btnUploadTrigger.addEventListener('click', () => hiddenFileInput.click());

    hiddenFileInput.addEventListener('change', (e) => {
        const fileAsset = e.target.files[0];
        if (!fileAsset) return;

        const fileAssetReader = new FileReader();
        fileAssetReader.onload = (event) => {
            base64ImageUploadString = event.target.result; 
            modalAvatarPreview.src = base64ImageUploadString;
        };
        fileAssetReader.readAsDataURL(fileAsset);
    });

    btnSaveProfile.addEventListener('click', async () => {
        const newName = editUsernameInput.value.trim() || currentProfileConfig.name;
        const rawRole = editRoleInput.value.trim() || currentProfileConfig.role;
        const finalRole = rawRole.startsWith('Role: ') ? rawRole : `Role: ${rawRole}`;

        const updatePayload = {
            name: newName,
            role: finalRole,
            avatar_base64: base64ImageUploadString, 
            bg_mode: currentProfileConfig.bg_mode || "3d-particles"
        };

        btnSaveProfile.innerText = "Syncing...";
        btnSaveProfile.disabled = true;

        try {
            const syncResponse = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            if (syncResponse.ok) {
                updateLocalUIDisplays(newName, finalRole, base64ImageUploadString);
                currentProfileConfig.name = newName;
                currentProfileConfig.role = finalRole;
                if (base64ImageUploadString) {
                    currentProfileConfig.avatar = base64ImageUploadString; 
                }
                profileModal.classList.add('hidden');
            } else {
                alert("Failed to sync profile changes to backend.");
            }
        } catch (error) {
            console.error("[PROF] HTTP Error:", error);
        } finally {
            btnSaveProfile.innerText = "Sync changes";
            btnSaveProfile.disabled = false;
        }
    });

    function updateLocalUIDisplays(name, role, avatarBase64) {
        profNameDisplay.innerText = name;
        profRoleDisplay.innerText = role;
        if (avatarBase64) {
            globalAvatarImg.src = avatarBase64;
        }
    }

    async function loadPersistentPreferences() {
        try {
            const prefResponse = await fetch('/api/preferences');
            if (prefResponse.ok) {
                currentProfileConfig = await prefResponse.json(); 
                profNameDisplay.innerText = currentProfileConfig.name;
                profRoleDisplay.innerText = currentProfileConfig.role;
                globalAvatarImg.src = currentProfileConfig.avatar + "?t=" + new Date().getTime(); 
            }
        } catch (error) { console.error("[PROF] Persistent load failure:", error); }
    }

    async function loadMasterChatHistory() {
        try {
            const histResponse = await fetch('/api/chat/history');
            if (histResponse.ok) {
                const historyPair = await histResponse.json(); 
                chatHistoryContainer.innerHTML = ''; 
                historyPair.forEach(msg => {
                    appendChatBubble(msg.sender, msg.text);
                });
            }
        } catch (error) { console.error("[CHAT] History load failure:", error); }
    }

    btnClearChat.addEventListener('click', async () => {
        const histClearResponse = await fetch('/api/chat/clear', { method: 'DELETE' });
        if (histClearResponse.ok) {
            chatHistoryContainer.innerHTML = '';
            appendChatBubble('assistant', 'Chat history truncated from disk.');
        }
    });

    // RESTORED BUBBLE ALIGNMENT LOGIC
    function appendChatBubble(sender, text) {
        const timestampString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const userAvatarPath = (currentProfileConfig && sender === 'user') ? globalAvatarImg.src : '/static/assets/user-avatar.png';
        const assistantAvatarPath = '/static/assets/sh1v-logo.png'; 

        const avatarPath = sender === 'user' ? userAvatarPath : assistantAvatarPath;

        const chatMsgRow = document.createElement('div');
        chatMsgRow.className = `msg-row ${sender}`;
        chatMsgRow.innerHTML = `
            <div class="msg-icon">
                <img src="${avatarPath}" alt="${sender}">
            </div>
            <div class="bubble">
                <p>${text}</p>
                <p class="time-stamp">${sender.toUpperCase()} | ${timestampString}</p>
            </div>
        `;
        chatHistoryContainer.appendChild(chatMsgRow);
        chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    }

    // EXPOSED GLOBAL FUNCTION FOR VOICE ENGINE TO CALL
    window.executeChatMessage = async function() {
        const userCommandString = chatInput.value.trim();
        if (!userCommandString) return;

        appendChatBubble('user', userCommandString);
        chatInput.value = ''; 

        // Uses your network switcher logic correctly
        const endpointTarget = currentNetworkMode === 'hybrid' ? '/api/chat-hybrid' : '/api/chat-offline';

        try {
            const chatExecResponse = await fetch(endpointTarget, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userCommandString })
            });

            if (chatExecResponse.ok) {
                const responseData = await chatExecResponse.json(); 
                appendChatBubble('assistant', responseData.response);
                appendConsoleFeedback(`[EXEC] Request OK | Pipeline: ${currentNetworkMode}`);
                
                // NEW: TRIGGER VOICE ENGINE (TTS)
                if (typeof speakMatrixPayload === 'function') {
                    speakMatrixPayload(responseData.response);
                }
            }
        } catch (error) { console.error("[EXEC] HTTP pipeline error:", error); }
    }

    sendBtn.addEventListener('click', window.executeChatMessage);
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') window.executeChatMessage();
    });

    function appendConsoleFeedback(text) {
        if (!viewConsole.classList.contains('hidden')) {
            const consoleMsg = document.createElement('p');
            consoleMsg.className = "sys-msg";
            consoleMsg.innerText = text;
            viewConsole.appendChild(consoleMsg);
            viewConsole.scrollTop = viewConsole.scrollHeight;
        }
    }

    // RESTORED SYSTEM STATS MATRICES
    function startTelemetryInstrumentation() {
        setInterval(async () => {
            try {
                const telResponse = await fetch('/api/sysinfo');
                if (telResponse.ok) {
                    const telData = await telResponse.json(); 
                    updateTelemetryDisplays(telData);
                }
            } catch (error) { console.error("[TEL]Instrumentation fetch error:", error); }
        }, 1000);
    }

    function updateTelemetryDisplays(data) {
        if(cpuRingVal) cpuRingVal.innerText = data.cpu;
        const ringValuePct =  data.cpu; 
        const ringColorGradient = `conic-gradient(var(--neon-cyan) 0%, var(--neon-purple) ${ringValuePct}%, rgba(255,255,255,0.05) ${ringValuePct}%)`;
        if(cpuRingVal) cpuRingVal.closest('.ring-container').style.background = ringColorGradient;

        if(cpuBarLabel) cpuBarLabel.innerText = `${data.cpu}%`;
        if(cpuBarFill) cpuBarFill.style.width = `${data.cpu}%`;

        if(ramBarLabel) ramBarLabel.innerText = `${data.ram_percent}%`;
        if(ramBarFill) ramBarFill.style.width = `${data.ram_percent}%`;
        if(ramPillVal) ramPillVal.innerText = `${data.ram_percent}%`;
        if(ramUsedPillVal) ramUsedPillVal.innerText = `${data.ram_used} / 4 GB`; 

        if(uptimePillVal) uptimePillVal.innerText = data.uptime;
    }

    initAppCore();
});
