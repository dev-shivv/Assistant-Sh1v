/* =========================================================
   js3-events.js
   All interactivity lives here.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Scope toggle ---------- */
  document.getElementById("scope-toggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".scope-btn");
    if (!btn) return;
    state.scope = btn.dataset.scope;
    renderScopeToggle();
  });

  /* ---------- Collapse panels ---------- */
  document.querySelectorAll(".collapse-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      const body = panel.querySelector(".panel-body");
      const collapsed = body.style.display === "none";
      body.style.display = collapsed ? "" : "none";
      btn.style.transform = collapsed ? "" : "rotate(180deg)";
    });
  });

  /* ---------- Mode dropdown ---------- */
  const modeStatus = document.getElementById("mode-status");

  modeStatus.addEventListener("click", (e) => {
    const option = e.target.closest("li[data-mode]");
    if (option) {
      state.activeMode = option.dataset.mode;
      renderStatusPills();
      modeStatus.setAttribute("data-open", "false");
      return;
    }

    const isOpen = modeStatus.getAttribute("data-open") === "true";
    modeStatus.setAttribute("data-open", isOpen ? "false" : "true");
  });

  document.addEventListener("click", (e) => {
    if (!modeStatus.contains(e.target)) {
      modeStatus.setAttribute("data-open", "false");
    }
  });

  /* ---------- Search ---------- */
  const searchInput = document.getElementById("search-input");

  document.getElementById("search-send-btn").addEventListener("click", () => submitSearch());

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitSearch();
  });

  function submitSearch() {
    const value = searchInput.value.trim();
    if (!value) return;

    addTerminalLines([
      { type: "blank" },
      { type: "prompt", text: `sh1v@assistant:~$ ${value}` }
    ]);

    searchInput.value = "";
  }

  /* ---------- Chat ---------- */

  const messageInput = document.getElementById("message-input");

  document.getElementById("message-send-btn").addEventListener("click", () => {
    submitMessage();
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitMessage();
    }
  });

  async function submitMessage() {

    const value = messageInput.value.trim();
    if (!value) return;

    // Show user message instantly
    addChatMessage({
      id: `m${Date.now()}`,
      sender: "user",
      name: "You",
      time: currentTime(),
      type: "text",
      content: value
    });

    messageInput.value = "";

    try {

      const reply = await sendChatMessage(value);

      addChatMessage({
        id: `m${Date.now()}`,
        sender: "assistant",
        name: "Sh1V",
        time: currentTime(),
        type: "text",
        content: reply
      });

    } catch (err) {

      console.error(err);

      addChatMessage({
        id: `m${Date.now()}`,
        sender: "assistant",
        name: "System",
        time: currentTime(),
        type: "text",
        content: "❌ Failed to connect to backend."
      });

    }

  }

  /* ---------- Buttons ---------- */

  document.getElementById("attach-btn").addEventListener("click", () => {
    console.log("Attach clicked");
  });

  document.getElementById("mic-btn").addEventListener("click", () => {
    console.log("Mic clicked");
  });

  /* ---------- Dynamic Chat Buttons ---------- */

  document.getElementById("chat-messages").addEventListener("click", (e) => {

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    if (btn.dataset.action === "optimize") {

      addChatMessage({
        id: `m${Date.now()}`,
        sender: "assistant",
        name: "Sh1V",
        time: currentTime(),
        type: "text",
        content: "Optimizing system..."
      });

      addTerminalLines([
        { type: "blank" },
        { type: "prompt", text: "sh1v@assistant:~$ system --optimize" },
        { type: "success", text: "[✓] Optimization started" }
      ]);

    }

    if (btn.dataset.action === "details") {

      addTerminalLines([
        { type: "blank" },
        { type: "prompt", text: "sh1v@assistant:~$ system --details" }
      ]);

    }

  });

  /* ---------- Terminal ---------- */

  document.getElementById("terminal-clear-btn").addEventListener("click", () => {

    state.terminalLog = [
      {
        type: "prompt",
        text: "sh1v@assistant:~$",
        cursor: true
      }
    ];

    renderTerminal();

  });

  /* ---------- Misc ---------- */

  document.getElementById("menu-btn").addEventListener("click", () => {
    console.log("Menu clicked");
  });

  document.getElementById("chat-options-btn").addEventListener("click", () => {
    console.log("Chat options clicked");
  });

  document.getElementById("terminal-options-btn").addEventListener("click", () => {
    console.log("Terminal options clicked");
  });

});

/* ========================================================= */

function addChatMessage(msg) {
  state.messages.push(msg);
  renderChat();
}

function addTerminalLines(lines) {
  state.terminalLog = state.terminalLog.filter(l => !l.cursor);
  state.terminalLog.push(
    ...lines,
    {
      type: "prompt",
      text: "sh1v@assistant:~$",
      cursor: true
    }
  );
  renderTerminal();
}

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}