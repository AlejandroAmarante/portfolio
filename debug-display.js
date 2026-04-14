/* ═══════════════════════════════════════════════════════════════
   debug-display.js  —  FPS + Memory overlay
   Toggle: Ctrl + Shift + D

   Memory notes:
   • performance.memory is Chrome/Edge only (non-standard).
   • Firefox and Safari do not expose it — fields show "n/a".
   • Chrome quantizes values (~100 KB resolution) unless the page
     is cross-origin isolated (COOP + COEP headers). Values are
     still useful directionally either way.
   • performance.measureUserAgentSpecificMemory() is the modern
     standard but requires crossOriginIsolated and is async —
     we sample it on a 2 s interval when available.
═══════════════════════════════════════════════════════════════ */
(function initDebugDisplay() {
  /* ── Styles ─────────────────────────────────────────────── */
  const STYLES = `
    #debug-overlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      line-height: 1.8;
      letter-spacing: 0.1em;
      color: #ededed;
      background: rgba(8,8,8,0.82);
      border: 1px solid #242424;
      border-left: 2px solid #ea027e;
      padding: 10px 14px 10px 12px;
      min-width: 200px;
      pointer-events: none;
      user-select: none;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #debug-overlay.visible {
      opacity: 1;
      transform: translateY(0);
    }
    #debug-overlay .dbg-header {
      font-size: 9px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #ea027e;
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1px solid #242424;
    }
    #debug-overlay .dbg-section-label {
      font-size: 8px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #414040;
      margin-top: 7px;
      margin-bottom: 1px;
    }
    #debug-overlay .dbg-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
    #debug-overlay .dbg-label  { color: #7a7a7a; }
    #debug-overlay .dbg-value  { color: #ededed; text-align: right; }
    #debug-overlay .dbg-value.warn  { color: #f5a623; }
    #debug-overlay .dbg-value.crit  { color: #ea027e; }
    #debug-overlay .dbg-value.muted { color: #414040; font-style: italic; }
    #debug-overlay .dbg-mem-source {
      font-size: 8px;
      color: #414040;
      letter-spacing: 0.1em;
      margin-top: 3px;
      font-style: italic;
    }
    #debug-overlay .dbg-hint {
      margin-top: 7px;
      padding-top: 5px;
      border-top: 1px solid #242424;
      font-size: 9px;
      color: #414040;
      letter-spacing: 0.14em;
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  /* ── DOM ────────────────────────────────────────────────── */
  const overlay = document.createElement("div");
  overlay.id = "debug-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="dbg-header">// debug</div>

    <div class="dbg-section-label">render</div>
    <div class="dbg-row"><span class="dbg-label">FPS</span><span class="dbg-value" id="dbg-fps">—</span></div>
    <div class="dbg-row"><span class="dbg-label">FRAME Δ</span><span class="dbg-value" id="dbg-frame">—</span></div>

    <div class="dbg-section-label">memory</div>
    <div class="dbg-row"><span class="dbg-label">JS HEAP</span><span class="dbg-value" id="dbg-heap">—</span></div>
    <div class="dbg-row"><span class="dbg-label">HEAP LIMIT</span><span class="dbg-value" id="dbg-limit">—</span></div>
    <div class="dbg-row"><span class="dbg-label">HEAP %</span><span class="dbg-value" id="dbg-heappct">—</span></div>
    <div class="dbg-mem-source" id="dbg-mem-source"></div>

    <div class="dbg-hint">ctrl+shift+d to close</div>
  `;
  document.body.appendChild(overlay);

  /* ── Element refs ───────────────────────────────────────── */
  const elFps = document.getElementById("dbg-fps");
  const elFrame = document.getElementById("dbg-frame");
  const elHeap = document.getElementById("dbg-heap");
  const elLimit = document.getElementById("dbg-limit");
  const elHeapPct = document.getElementById("dbg-heappct");
  const elMemSource = document.getElementById("dbg-mem-source");

  /* ── Memory source detection (one-time at boot) ─────────── */
  //  Tier 1 — modern standard, requires crossOriginIsolated
  //  Tier 2 — legacy Chrome/Edge non-standard (quantized ~100 KB)
  //  Tier 3 — not available (Firefox, Safari)
  const MEM_SOURCE = (() => {
    if (
      window.crossOriginIsolated &&
      typeof performance.measureUserAgentSpecificMemory === "function"
    )
      return "modern";
    if (
      performance.memory &&
      typeof performance.memory.usedJSHeapSize === "number" &&
      performance.memory.usedJSHeapSize > 0
    )
      return "legacy";
    return "none";
  })();

  const SOURCE_LABEL = {
    modern: "src: measureUserAgentSpecificMemory",
    legacy: "src: performance.memory (quantized)",
    none: "src: not available in this browser",
  };
  elMemSource.textContent = SOURCE_LABEL[MEM_SOURCE];

  // Shared snapshot written by the async poller (modern) or sync each frame (legacy)
  let memUsed = null; // bytes
  let memLimit = null; // bytes
  let modernMemTimer = null;

  async function pollModernMemory() {
    try {
      const result = await performance.measureUserAgentSpecificMemory();
      memUsed = result.bytes;
      memLimit = performance.memory?.jsHeapSizeLimit ?? null;
    } catch (_) {}
    if (visible) modernMemTimer = setTimeout(pollModernMemory, 2000);
  }

  /* ── Colour helpers ─────────────────────────────────────── */
  const mb = (b) => (b / 1048576).toFixed(1) + " MB";

  function heapClass(usedB, limitB) {
    if (!limitB) return "";
    const p = (usedB / limitB) * 100;
    if (p >= 80) return "crit";
    if (p >= 60) return "warn";
    return "";
  }
  function fpsClass(f) {
    return f < 30 ? "crit" : f < 45 ? "warn" : "";
  }
  function frameClass(ms) {
    return ms >= 33 ? "crit" : ms >= 22 ? "warn" : "";
  }

  /* ── Memory display ─────────────────────────────────────── */
  function updateMemory() {
    if (MEM_SOURCE === "none") {
      elHeap.textContent = "n/a";
      elLimit.textContent = "n/a";
      elHeapPct.textContent = "n/a";
      elHeap.className =
        elLimit.className =
        elHeapPct.className =
          "dbg-value muted";
      return;
    }

    // Legacy: pull fresh values synchronously each frame
    if (MEM_SOURCE === "legacy") {
      memUsed = performance.memory.usedJSHeapSize;
      memLimit = performance.memory.jsHeapSizeLimit;
    }

    if (memUsed == null) {
      // Modern API not resolved yet
      elHeap.textContent = elLimit.textContent = elHeapPct.textContent = "…";
      return;
    }

    const cls = heapClass(memUsed, memLimit);

    elHeap.textContent = mb(memUsed);
    elHeap.className = "dbg-value " + cls;

    elLimit.textContent = memLimit ? mb(memLimit) : "—";
    elLimit.className = "dbg-value";

    elHeapPct.textContent = memLimit
      ? ((memUsed / memLimit) * 100).toFixed(1) + "%"
      : "—";
    elHeapPct.className = "dbg-value " + cls;
  }

  /* ── Loop state ─────────────────────────────────────────── */
  let visible = false;
  let rafId = null;
  let frameCount = 0;
  let fps = 0;
  let lastFpsTs = 0;
  let lastFrameTs = 0;

  /* ── rAF tick — only runs while overlay is visible ──────── */
  function tick(ts) {
    if (!visible) return;

    const delta = ts - lastFrameTs;
    lastFrameTs = ts;
    frameCount++;

    if (ts - lastFpsTs >= 1000) {
      fps = Math.round((frameCount * 1000) / (ts - lastFpsTs));
      frameCount = 0;
      lastFpsTs = ts;
    }

    elFps.textContent = fps > 0 ? fps : "—";
    elFps.className = "dbg-value " + fpsClass(fps);

    elFrame.textContent = delta.toFixed(1) + " ms";
    elFrame.className = "dbg-value " + frameClass(delta);

    updateMemory();

    rafId = requestAnimationFrame(tick);
  }

  /* ── Toggle ─────────────────────────────────────────────── */
  function show() {
    visible = true;
    frameCount = 0;
    fps = 0;
    lastFpsTs = performance.now();
    lastFrameTs = performance.now();
    overlay.classList.add("visible");
    rafId = requestAnimationFrame(tick);
    if (MEM_SOURCE === "modern") pollModernMemory();
  }

  function hide() {
    visible = false;
    overlay.classList.remove("visible");
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (modernMemTimer) {
      clearTimeout(modernMemTimer);
      modernMemTimer = null;
    }
  }

  /* ── Key binding: Ctrl + Shift + D ─────────────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();
      visible ? hide() : show();
    }
  });
})();
