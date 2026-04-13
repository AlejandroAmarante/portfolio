/* ═══════════════════════════════════════════════════════════════
   script.js  —  performance-optimised
   Key changes vs. previous version:
   • GoL draw: ImageData + Uint32Array replaces N fillRect calls
     (one putImageData per frame instead of up to ~20 K canvas ops)
   • GoL COLOR_LUT: Uint32 values instead of rgba() strings
   • GoL step: per-step threshold constants hoisted outside inner loop
   • GoL: removed dead PATTERNS array
   • Cursor ring: skips DOM write when position has converged
   • Tooltip mousemove: rAF-gated so layout is touched ≤ once/frame
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   1. UTILITIES
───────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;
const hasHover = window.matchMedia("(hover: hover)").matches;

/* ─────────────────────────────────────────────────────────────
   2. CURSOR
───────────────────────────────────────────────────────────── */
(function initCursor() {
  if (!hasHover) return;

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function tick() {
    const dx = mx - rx;
    const dy = my - ry;
    // Only write to the DOM when the ring hasn't yet settled —
    // avoids triggering style recalcs every frame while the user is idle.
    if (dx * dx + dy * dy > 0.01) {
      rx = lerp(rx, mx, 0.15);
      ry = lerp(ry, my, 0.15);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    }
    requestAnimationFrame(tick);
  })();

  const hoverSelector = "a,button,.project-card,.project-media,.contact-row";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelector))
      document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelector))
      document.body.classList.remove("cursor-hover");
  });
  document.addEventListener("mousedown", () =>
    document.body.classList.add("cursor-click"),
  );
  document.addEventListener("mouseup", () =>
    document.body.classList.remove("cursor-click"),
  );
})();

/* ─────────────────────────────────────────────────────────────
   3. CONWAY'S GAME OF LIFE
───────────────────────────────────────────────────────────── */
(function initGoL() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const CELL = 10;
  const STEP_MS = 200;
  const SEED_DENSITY = 0.28;
  const LOW_ALIVE_MIN = 0.045;
  const LOW_ALIVE_FRAMES = 18;
  const FADE_IN = 6; // was 18  → ~42 frames (~700 ms) to fully appear
  const FADE_OUT = 3; // was 9   → ~85 frames (~1.4 s) to fully disappear
  const MAX_OPACITY = 0.085; // was 0.065 → slightly brighter to compensate for the slower build
  const TARGET_ALIVE_RATIO = 0.2;

  // ── Pixel-buffer colour constants ────────────────────────────
  // ImageData exposes RGBA bytes; viewed as a Uint32Array on a
  // little-endian CPU the layout is 0xAABBGGRR.
  //
  // Background: RGBA(8, 8, 8, 255)  →  0xFF080808
  const BG_COLOR = 0xff080808;

  // Precompute 256 blended cell colours.
  // A cell at fade level i appears as white at opacity (i/255)*MAX_OPACITY
  // composited over the #080808 background:
  //   v = round(8 + 247 * (i/255) * MAX_OPACITY)
  // Storing as Uint32 avoids string allocation and rgba() parsing on every draw.
  const COLOR_LUT = new Uint32Array(256);
  for (let i = 1; i < 256; i++) {
    const v = (8 + 247 * (i / 255) * MAX_OPACITY + 0.5) | 0;
    COLOR_LUT[i] = (0xff << 24) | (v << 16) | (v << 8) | v;
  }

  let W, H, cols, rows, count;
  let grid, next, fade;
  let left, right, up, down;
  let gradient;
  let imgData, buf32; // pixel buffer — recreated on resize
  let lowFrames = 0;

  // ── Helpers ──────────────────────────────────────────────────
  function rebuildLookups() {
    left = new Uint16Array(cols);
    right = new Uint16Array(cols);
    up = new Uint16Array(rows);
    down = new Uint16Array(rows);
    for (let i = 0; i < cols; i++) {
      left[i] = (i - 1 + cols) % cols;
      right[i] = (i + 1) % cols;
    }
    for (let i = 0; i < rows; i++) {
      up[i] = (i - 1 + rows) % rows;
      down[i] = (i + 1) % rows;
    }
  }

  function buildGradient() {
    const g = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.62,
    );
    g.addColorStop(0, "transparent");
    g.addColorStop(1, "rgba(0,0,0,0.58)");
    return g;
  }

  function seed() {
    for (let i = 0; i < count; i++) {
      const a = Math.random() < SEED_DENSITY;
      grid[i] = a ? 1 : 0;
      fade[i] = a ? 96 + ((Math.random() * 159) | 0) : 0;
    }
  }

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    cols = Math.ceil(W / CELL);
    rows = Math.ceil(H / CELL);
    count = cols * rows;

    grid = new Uint8Array(count);
    next = new Uint8Array(count);
    fade = new Uint8Array(count);

    // Single pixel buffer for the entire canvas.
    // Reusing one ImageData + Uint32Array view is far cheaper than
    // createImageData every frame or individual fillRect calls.
    imgData = ctx.createImageData(W, H);
    buf32 = new Uint32Array(imgData.data.buffer);

    rebuildLookups();
    gradient = buildGradient();
    seed();
  }

  // ── Simulation step ──────────────────────────────────────────
  function step() {
    let alive = 0;
    for (let i = 0; i < count; i++) alive += grid[i];

    const ratio = alive / count;
    const bias = Math.max(
      -0.25,
      Math.min(0.25, (TARGET_ALIVE_RATIO - ratio) * 1.25),
    );

    // Hoist threshold arithmetic out of the inner loop — these are
    // constant for the entire step and would otherwise be recomputed
    // once per cell (~20 K times on a full-HD screen).
    const t1 = 0.65 + bias;
    const t2 = 0.08 + bias * 0.2;
    const t3 = 0.38 + bias;
    const t4 = 0.16 + bias * 0.5;
    const t5 = 0.012 + Math.max(bias, 0) * 0.03;

    let nextAlive = 0;

    for (let y = 0; y < rows; y++) {
      const rU = up[y] * cols;
      const rC = y * cols;
      const rD = down[y] * cols;

      for (let x = 0; x < cols; x++) {
        const i = rC + x;
        const lx = left[x];
        const rx = right[x];

        const n =
          grid[rU + lx] +
          grid[rU + x] +
          grid[rU + rx] +
          grid[rC + lx] +
          grid[rC + rx] +
          grid[rD + lx] +
          grid[rD + x] +
          grid[rD + rx];

        const a = grid[i];
        let lives = 0;

        if (a) {
          if (n === 2 || n === 3) lives = 1;
          else if (n === 1 || n === 4) lives = Math.random() < t1 ? 1 : 0;
          else lives = Math.random() < t2 ? 1 : 0;
        } else {
          if (n === 3) lives = 1;
          else if (n === 2) lives = Math.random() < t3 ? 1 : 0;
          else if (n === 4) lives = Math.random() < t4 ? 1 : 0;
          else if (n === 1) lives = Math.random() < t5 ? 1 : 0;
          else lives = Math.random() < 0.0008 ? 1 : 0;
        }

        next[i] = lives;
        nextAlive += lives;
      }
    }

    [grid, next] = [next, grid];

    if (nextAlive < count * LOW_ALIVE_MIN) {
      if (++lowFrames >= LOW_ALIVE_FRAMES) {
        seed();
        lowFrames = 0;
      }
    } else {
      lowFrames = 0;
    }
  }

  // ── Render ───────────────────────────────────────────────────
  function draw() {
    // One typed-array fill clears the whole frame — replaces the
    // ctx.fillRect("#080808") call with zero canvas overhead.
    buf32.fill(BG_COLOR);

    const cellW = CELL - 1; // 9 px painted width
    const cellH = CELL - 1; // 9 px painted height

    for (let i = 0; i < count; i++) {
      // Advance fade inline (avoids a second full-count loop)
      if (grid[i]) {
        const f = fade[i] + FADE_IN;
        fade[i] = f > 255 ? 255 : f;
      } else {
        const f = fade[i] - FADE_OUT;
        fade[i] = f < 0 ? 0 : f;
      }

      if (!fade[i]) continue;

      const color = COLOR_LUT[fade[i]];
      const cx = (i % cols) * CELL;
      const cy = ((i / cols) | 0) * CELL;

      // Write each row of the cell as a contiguous slice.
      // buf32.fill(value, start, end) is implemented natively and
      // is dramatically faster than N individual property assignments
      // or ctx.fillRect calls with intervening state changes.
      for (let dy = 0; dy < cellH; dy++) {
        const rowStart = (cy + dy) * W + cx;
        buf32.fill(color, rowStart, rowStart + cellW);
      }
    }

    // Push the completed pixel buffer to the canvas in one call.
    ctx.putImageData(imgData, 0, 0);

    // Gradient vignette: a single composite fill over the finished frame.
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Loop ─────────────────────────────────────────────────────
  let last = 0;
  function loop(ts) {
    if (ts - last > STEP_MS) {
      step();
      last = ts;
    }
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(loop);
})();

/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL
───────────────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (let e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
  );

  els.forEach((el) => io.observe(el));
})();

/* ─────────────────────────────────────────────────────────────
   5. MOBILE NAV
───────────────────────────────────────────────────────────── */
(function initMobileNav() {
  const burger = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  if (!burger || !menu) return;

  const toggle = () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", !open);
    menu.classList.toggle("open", !open);
    menu.setAttribute("aria-hidden", open);
    document.body.style.overflow = open ? "" : "hidden";
  };

  burger.addEventListener("click", toggle);
  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-mobile-link]")) toggle();
  });
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") toggle();
//   });
})();

/* ─────────────────────────────────────────────────────────────
   6. MODAL
───────────────────────────────────────────────────────────── */
(function initModal() {
  const modal = document.getElementById("modal");
  const backdrop = document.getElementById("modal-backdrop");
  const content = document.getElementById("modal-content");
  const closeBtn = document.getElementById("modal-close");
  if (!modal || !content) return;

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => (content.innerHTML = ""), 300);
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-modal-trigger]");
    if (!trigger) return;

    content.innerHTML = "";
    const media = trigger.querySelector("img,video");

    if (media?.tagName === "IMG") {
      const el = new Image();
      el.src = media.src;
      content.appendChild(el);
    } else if (media?.tagName === "VIDEO") {
      const el = media.cloneNode();
      el.autoplay = el.loop = el.muted = true;
      content.appendChild(el);
      el.play().catch(() => {});
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });
})();

/* ─────────────────────────────────────────────────────────────
   7. EMAIL COPY
   Tooltip position is written inside a rAF callback so layout
   is touched at most once per display frame rather than on every
   raw mousemove event (which can fire far more often than 60 Hz).
───────────────────────────────────────────────────────────── */
(function initEmailCopy() {
  const btn = document.getElementById("email-copy");
  const tooltip = document.getElementById("copy-tooltip");
  if (!btn || !tooltip) return;

  const email = btn.dataset.email || "";
  let hideTimer;
  let pendingX = 0,
    pendingY = 0,
    rafScheduled = false;

  document.addEventListener("mousemove", (e) => {
    pendingX = e.clientX;
    pendingY = e.clientY;
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(() => {
        tooltip.style.transform = `translate(${pendingX}px,${pendingY}px)`;
        rafScheduled = false;
      });
    }
  });

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      clearTimeout(hideTimer);
      tooltip.classList.add("visible");
      hideTimer = setTimeout(() => tooltip.classList.remove("visible"), 1600);
    } catch {}
  });
})();
