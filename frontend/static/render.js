/* ==========================================
   frontend/static/render.js
   ================================== */

document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('ambient-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'ambient-canvas';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Create 3 massive, slow-moving ambient light orbs
    // We use your primary Matrix UI colors: Purple, Cyan, Blue
    const orbs = [
        { x: width * 0.2, y: height * 0.3, r: width * 0.5, color: 'rgba(179, 136, 255,', vx: 0.6, vy: 0.4 }, // Purple
        { x: width * 0.8, y: height * 0.7, r: width * 0.4, color: 'rgba(0, 229, 255,', vx: -0.5, vy: -0.6 }, // Cyan
        { x: width * 0.5, y: height * 0.5, r: width * 0.45, color: 'rgba(41, 121, 255,', vx: 0.4, vy: -0.3 }  // Blue
    ];

    let targetFPS = 30;
    let isStaticMode = false;

    const bgModeSelect = document.getElementById('setting-bg-mode');
    if (bgModeSelect) {
        bgModeSelect.addEventListener('change', (e) => {
            isStaticMode = (e.target.value === 'static');
            if (isStaticMode) ctx.clearRect(0, 0, width, height);
        });
    }

    function drawOrbs() {
        if (isStaticMode) return;
        ctx.clearRect(0, 0, width, height);
        
        // Blend colors cleanly when orbs overlap
        ctx.globalCompositeOperation = 'screen';

        orbs.forEach(orb => {
            // Move orbs
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Bounce off the edges of the universe
            if (orb.x < -orb.r || orb.x > width + orb.r) orb.vx *= -1;
            if (orb.y < -orb.r || orb.y > height + orb.r) orb.vy *= -1;

            // Create soft lighting gradient
            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
            gradient.addColorStop(0, orb.color + '0.12)'); // Center opacity (low so it doesn't blind the UI)
            gradient.addColorStop(1, orb.color + '0)');    // Fade to transparent edge

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    let then = Date.now();
    function renderLoop() {
        requestAnimationFrame(renderLoop);
        const now = Date.now();
        const fpsInterval = 1000 / targetFPS;
        if (now - then > fpsInterval) {
            then = now - ((now - then) % fpsInterval);
            drawOrbs();
        }
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Dynamically resize light radius based on screen size
        orbs[0].r = width * 0.5;
        orbs[1].r = width * 0.4;
        orbs[2].r = width * 0.45;
    });

    console.log("[RENDER] Fluid Ambient Color Engine Operational.");
    renderLoop();
});
