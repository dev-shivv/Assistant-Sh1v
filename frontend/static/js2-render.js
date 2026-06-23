/* =========================================================
   js2-render.js
   Pure rendering layer: reads `state` (js1) and writes DOM.
   Contains no event listeners — js3-events.js owns those,
   and calls render__() functions again after state changes.
   ========================================================= */

const colorMap = {
  purple: { var: "--accent-purple", bg: "rgba(139,92,246,0.18)" },
  blue:   { var: "--accent-blue",   bg: "rgba(59,130,246,0.18)" },
  green:  { var: "--accent-green",  bg: "rgba(34,197,94,0.18)" },
  cyan:   { var: "--accent-cyan",   bg: "rgba(56,189,248,0.18)" }
};

const iconPaths = {
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 2V6M15 2V6M9 18V22M15 18V22M2 9H6M2 15H6M18 9H22M18 15H22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  memory: '<rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 6V3M12 6V3M17 6V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  disk: '<ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="1.6"/><path d="M4 6V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V6" stroke="currentColor" stroke-width="1.6"/>',
  network: '<path d="M5 12.5C8 9 16 9 19 12.5M2 8.5C7 3 17 3 22 8.5M9 16C10.5 14.3 13.5 14.3 15 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/>'
};

function svgIcon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${iconPaths[name] || ""}</svg>`;
}

/* ---------- System Overview ---------- */
function renderSystemOverview() {
  const { cpuPercent, uptime, cpuHistory, ram, disk } = state.system;

  const ring = document.getElementById("cpu-ring");
  ring.style.setProperty("--percent", cpuPercent);
  document.getElementById("cpu-ring-value").textContent = `${cpuPercent}%`;
  document.getElementById("uptime-value").textContent = uptime;

  // sparkline
  const max = Math.max(...cpuHistory);
  const min = Math.min(...cpuHistory);
  const range = max - min || 1;
  const points = cpuHistory.map((v, i) => {
    const x = (i / (cpuHistory.length - 1)) * 100;
    const y = 28 - ((v - min) / range) * 26;
    return `${x},${y}`;
  }).join(" ");
  document.getElementById("cpu-sparkline").innerHTML =
    `<polyline points="${points}" fill="none" stroke="var(--accent-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

  // RAM / DISK meters
  const meters = [
    { label: "RAM", valueText: `${ram.used} / ${ram.total} ${ram.unit}`, percent: (ram.used / ram.total) * 100, color: "purple" },
    { label: "DISK", valueText: `${disk.used} / ${disk.total} ${disk.unit}`, percent: (disk.used / disk.total) * 100, color: "blue" }
  ];
  document.getElementById("overview-meters").innerHTML = meters.map(meterRowHTML).join("");
}

/* ---------- Performance ---------- */
function renderPerformance() {
  const { cpu, memory, disk, network } = state.performance;
  const meters = [
    { label: "CPU Usage", valueText: `${cpu}%`, percent: cpu, color: "purple" },
    { label: "Memory Usage", valueText: `${memory}%`, percent: memory, color: "blue" },
    { label: "Disk Usage", valueText: `${disk}%`, percent: disk, color: "green" }
  ];
  document.getElementById("performance-meters").innerHTML = meters.map(meterRowHTML).join("");
  document.getElementById("net-down-value").textContent = network.down;
  document.getElementById("net-up-value").textContent = network.up;
}

function meterRowHTML(m) {
  const colorVar = colorMap[m.color] ? colorMap[m.color].var : "--accent-purple";
  return `
    <div class="meter-row">
      <div class="meter-row-top">
        <span class="meter-label">${m.label}</span>
        <span class="meter-value">${m.valueText}</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill" style="width:${m.percent}%; --fill-color: var(${colorVar});"></div>
      </div>
    </div>`;
}

/* ---------- Profile ---------- */
function renderProfile() {
  document.querySelector(".profile-name").textContent = state.profile.name;
  document.getElementById("profile-status-text").textContent = state.profile.statusText;
  document.querySelector("#profile-card .status-dot")
    .setAttribute("data-status", state.profile.online ? "online" : "offline");
}

/* ---------- Scope toggle (Internal / External) ---------- */
function renderScopeToggle() {
  document.getElementById("scope-toggle").setAttribute("data-active", state.scope);
}

/* ---------- Keyboard + Mode status pills ---------- */
function renderStatusPills() {
  document.getElementById("keyboard-status-text").textContent = state.keyboard.label;
  document.querySelector("#keyboard-status .status-dot")
    .setAttribute("data-status", state.keyboard.online ? "online" : "offline");

  document.getElementById("mode-value-text").textContent = state.activeMode;
  document.getElementById("mode-options").innerHTML = state.modes.map(mode => `
    <li data-mode="${mode}" data-selected="${mode === state.activeMode}">${mode}</li>
  `).join("");
}

/* ---------- Chat ---------- */
function renderChat() {
  const container = document.getElementById("chat-messages");
  container.innerHTML = state.messages.map(messageHTML).join("");
  container.scrollTop = container.scrollHeight;
}

function messageHTML(msg) {
  const isUser = msg.sender === "user";
  const avatarInner = isUser
    ? '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 7V4M9 4H15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="12.5" r="1.2" fill="currentColor"/><circle cx="15" cy="12.5" r="1.2" fill="currentColor"/></svg>';

  const bodyHTML = msg.type === "analysis" ? analysisCardHTML(msg) : `<div class="bubble">${msg.content}</div>`;

  return `
    <div class="message-row ${isUser ? "message-row--user" : ""}">
      <div class="message-avatar">${avatarInner}</div>
      <div class="message-body">
        <div class="message-meta">
          <span class="message-meta-name">${msg.name}</span>
          <span>${msg.time}</span>
        </div>
        ${bodyHTML}
      </div>
    </div>`;
}

function analysisCardHTML(msg) {
  const itemsHTML = msg.items.map(item => {
    const c = colorMap[item.color] || colorMap.purple;
    return `
      <div class="analysis-item">
        <span class="analysis-item-icon" style="--item-color: var(${c.var}); --item-color-bg: ${c.bg};">
          ${svgIcon(item.icon)}
        </span>
        <span>${item.label}</span>
      </div>`;
  }).join("");

  const actionsHTML = msg.actions.map(a =>
    `<button class="btn btn--${a.style}" data-action="${a.id}">${a.label}</button>`
  ).join("");

  return `
    <div class="analysis-card">
      <div class="analysis-intro">${msg.intro}</div>
      <div class="analysis-list">${itemsHTML}</div>
      <div class="analysis-followup">${msg.followUp}</div>
      <div class="analysis-actions">${actionsHTML}</div>
    </div>`;
}

/* ---------- Terminal ---------- */
function renderTerminal() {
  const container = document.getElementById("terminal-log");
  container.innerHTML = state.terminalLog.map(terminalLineHTML).join("");
  container.scrollTop = container.scrollHeight;
}

function terminalLineHTML(line) {
  switch (line.type) {
    case "blank":
      return `<div class="term-line">&nbsp;</div>`;
    case "prompt":
      return `<div class="term-line term-line--prompt">${line.text}${line.cursor ? '<span class="term-cursor"></span>' : ""}</div>`;
    case "success":
      return `<div class="term-line term-line--success">${line.text}</div>`;
    case "header":
      return `<div class="term-line term-line--header">${line.text}</div>`;
    case "divider":
      return `<div class="term-line term-line--divider">${line.text}</div>`;
    case "data":
      return `<div class="term-line term-line--data">${line.text}</div>`;
    case "table":
      return tableHTML(line);
    case "bar":
      return barHTML(line.percent);
    default:
      return "";
  }
}

function tableHTML(line) {
  const headerRow = line.header.map(h => h.padEnd(8)).join("");
  const dataRows = line.rows.map(r => r.map(c => c.padEnd(8)).join("")).join("\n");
  return `<div class="term-line term-line--header">${headerRow}</div><div class="term-line term-line--data">${dataRows.replace(/\n/g, "<br>")}</div>`;
}

function barHTML(percent) {
  const totalBlocks = 30;
  const filled = Math.round((percent / 100) * totalBlocks);
  const bar = "█".repeat(filled) + "░".repeat(totalBlocks - filled);
  return `<div class="term-line term-line--success">${bar}</div>`;
}

/* ---------- Master render: call after any state change ---------- */
function renderAll() {
  renderSystemOverview();
  renderPerformance();
  renderProfile();
  renderScopeToggle();
  renderStatusPills();
  renderChat();
  renderTerminal();
}

document.addEventListener("DOMContentLoaded", renderAll);