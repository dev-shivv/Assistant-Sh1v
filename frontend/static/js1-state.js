/* =========================================================
   js1-state.js
   Owns ALL data for the dashboard. No DOM access here —
   js2-render.js reads this and draws it, js3-events.js
   updates it when the user interacts.
   ========================================================= */

const state = {

  scope: "internal", // "internal" | "external"

  system: {
    cpuPercent: 72,
    uptime: "03:00:45",
    // sparkline sample points (just relative values, js2 normalizes them)
    cpuHistory: [40, 55, 48, 62, 58, 70, 65, 72, 68, 72],
    ram: { used: 6.2, total: 8, unit: "GB" },
    disk: { used: 256, total: 512, unit: "GB" }
  },

  performance: {
    cpu: 72,
    memory: 78,
    disk: 45,
    network: { down: "120.4 Mbps", up: "48.7 Mbps" }
  },

  profile: {
    name: "Sh1V",
    statusText: "AI at your service",
    online: true
  },

  keyboard: { online: true, label: "ONLINE" },

  modes: ["Hybrid", "Online", "Offline"],
  activeMode: "Hybrid",

  // ----- Chat transcript -----
  // type: "text" | "analysis"
  messages: [
    {
      id: "m1",
      sender: "assistant",
      name: "Sh1V",
      time: "10:30 AM",
      type: "text",
      content: "Hello! How can I assist you today?"
    },
    {
      id: "m2",
      sender: "user",
      name: "You",
      time: "10:31 AM",
      type: "text",
      content: "Show me system status and help me optimize performance."
    },
    {
      id: "m3",
      sender: "assistant",
      name: "Sh1V",
      time: "10:31 AM",
      type: "analysis",
      intro: "Analyzing system...",
      items: [
        { icon: "cpu", color: "purple", label: "CPU Usage is high (72%)" },
        { icon: "memory", color: "blue", label: "Memory usage is optimal (78%)" },
        { icon: "disk", color: "green", label: "Disk usage is normal (45%)" },
        { icon: "network", color: "cyan", label: "Network is stable" }
      ],
      followUp: "Would you like me to optimize system performance?",
      actions: [
        { id: "optimize", label: "Optimize Now", style: "primary" },
        { id: "details", label: "Show Details", style: "secondary" }
      ]
    }
  ],

  // ----- Terminal log -----
  // type: "prompt" | "header" | "divider" | "data" | "success"
  terminalLog: [
    { type: "prompt", text: "sh1v@assistant:~$ system --status" },
    { type: "blank" },
    { type: "success", text: "[✓] System Status" },
    { type: "divider", text: "----------------" },
    { type: "data", text: "OS:      Sh1V OS 2.1.0" },
    { type: "data", text: "Uptime:  3h 0m 45s" },
    { type: "data", text: "Shell:   sh1v-shell" },
    { type: "data", text: "User:    sh1v" },
    { type: "data", text: "Load:    1.72, 2.01, 1.89" },
    { type: "divider", text: "----------------" },
    { type: "blank" },
    { type: "prompt", text: "sh1v@assistant:~$ top" },
    { type: "blank" },
    {
      type: "table",
      header: ["PID", "USER", "CPU%", "MEM%", "TIME+", "CMD"],
      rows: [
        ["1452", "sh1v", "12.3", "2.1", "0:32.21", "python"],
        ["1024", "root", "7.6", "1.3", "0:21.11", "systemd"],
        ["2048", "sh1v", "5.4", "3.6", "0:11.02", "assistant"],
        ["3096", "sh1v", "3.1", "1.1", "0:05.23", "watcher"],
        ["4120", "root", "2.2", "0.8", "0:02.11", "network"]
      ]
    },
    { type: "blank" },
    { type: "prompt", text: "sh1v@assistant:~$ memory --usage" },
    { type: "blank" },
    { type: "success", text: "[✓] Memory Usage" },
    { type: "divider", text: "----------------" },
    { type: "data", text: "Total: 8.0 GB" },
    { type: "data", text: "Used:  6.2 GB (78%)" },
    { type: "data", text: "Free:  1.8 GB (22%)" },
    { type: "blank" },
    { type: "bar", percent: 78 },
    { type: "blank" },
    { type: "prompt", text: "sh1v@assistant:~$", cursor: true }
  ]
};