/* ═══════════════════════════════════════════════════════════════
   cell-worker.js  —  Cellular Fade  (OffscreenCanvas Worker)

   Runs entirely off the main thread so scroll, hover, and all
   other JS interactions are completely free of simulation jank.

   Communication protocol (postMessage):
     main → worker  { type: 'init',   canvas: OffscreenCanvas, width, height }
     main → worker  { type: 'resize', width, height }

   Notes:
   • requestAnimationFrame is not available in Workers; we use a
     16 ms setTimeout loop instead. The browser automatically
     throttles setTimeout in background tabs — great for a bg effect.
   • Actual canvas redraws are capped at 30 fps; simulation steps
     every 200 ms. Both are far more than the eye needs here.
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const CELL = 10;
const STEP_MS = 200;
const FRAME_MS = 1000 / 30; // 30 fps render cap
const SEED_DENSITY = 0.28;
const LOW_ALIVE_MIN = 0.045;
const LOW_ALIVE_FRAMES = 18;
const FADE_IN = 6;
const FADE_OUT = 3;
const MAX_OPACITY = 0.085;
const TARGET_ALIVE = 0.2;

/* ─────────────────────────────────────────────────────────────
   PIXEL-BUFFER COLOUR CONSTANTS
   ImageData bytes viewed as Uint32 on little-endian CPU: 0xAABBGGRR
───────────────────────────────────────────────────────────── */
const BG_COLOR = 0xff080808; // #080808 fully opaque

// Pre-bake 256 blended cell colours — avoids any string / rgba()
// work inside the hot draw loop.
const COLOR_LUT = new Uint32Array(256);
for (let i = 1; i < 256; i++) {
  const v = (8 + 247 * (i / 255) * MAX_OPACITY + 0.5) | 0;
  COLOR_LUT[i] = (0xff << 24) | (v << 16) | (v << 8) | v;
}

/* ─────────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────────── */
let canvas, ctx;
let W, H, cols, rows, count;
let grid, next, fade;
let leftLUT, rightLUT, upLUT, downLUT;
let gradient;
let imgData, buf32;
let lowFrames = 0;
let lastStep = 0;
let lastDraw = 0;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function rebuildLookups() {
  leftLUT = new Uint16Array(cols);
  rightLUT = new Uint16Array(cols);
  upLUT = new Uint16Array(rows);
  downLUT = new Uint16Array(rows);
  for (let i = 0; i < cols; i++) {
    leftLUT[i] = (i - 1 + cols) % cols;
    rightLUT[i] = (i + 1) % cols;
  }
  for (let i = 0; i < rows; i++) {
    upLUT[i] = (i - 1 + rows) % rows;
    downLUT[i] = (i + 1) % rows;
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

function resize(w, h) {
  W = canvas.width = w;
  H = canvas.height = h;
  cols = Math.ceil(W / CELL);
  rows = Math.ceil(H / CELL);
  count = cols * rows;

  grid = new Uint8Array(count);
  next = new Uint8Array(count);
  fade = new Uint8Array(count);

  // Single pixel buffer for the whole canvas — recreated on resize.
  imgData = ctx.createImageData(W, H);
  buf32 = new Uint32Array(imgData.data.buffer);

  rebuildLookups();
  gradient = buildGradient();
  seed();
}

/* ─────────────────────────────────────────────────────────────
   SIMULATION STEP
   Rules are deliberately looser than classic GoL, producing the
   flowing cellular-fade effect rather than strict automaton patterns.
   Threshold constants are hoisted out of the inner loop — they are
   constant for the entire step and would otherwise be recomputed
   once per cell (~20 K times on a 1080p screen).
───────────────────────────────────────────────────────────── */
function step() {
  let alive = 0;
  for (let i = 0; i < count; i++) alive += grid[i];

  const ratio = alive / count;
  const bias = Math.max(-0.25, Math.min(0.25, (TARGET_ALIVE - ratio) * 1.25));

  const t1 = 0.65 + bias;
  const t2 = 0.08 + bias * 0.2;
  const t3 = 0.38 + bias;
  const t4 = 0.16 + bias * 0.5;
  const t5 = 0.012 + Math.max(bias, 0) * 0.03;

  let nextAlive = 0;

  for (let y = 0; y < rows; y++) {
    const rU = upLUT[y] * cols;
    const rC = y * cols;
    const rD = downLUT[y] * cols;

    for (let x = 0; x < cols; x++) {
      const i = rC + x;
      const lx = leftLUT[x];
      const rx = rightLUT[x];

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

  // Swap buffers in place — no allocation.
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

/* ─────────────────────────────────────────────────────────────
   RENDER
   One buf32.fill clears the frame; one putImageData pushes it.
   The gradient vignette is a single composite fillRect on top.
───────────────────────────────────────────────────────────── */
function draw() {
  buf32.fill(BG_COLOR);

  const cellW = CELL - 1;
  const cellH = CELL - 1;

  for (let i = 0; i < count; i++) {
    // Advance fade inline — avoids a second full-count loop.
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

    for (let dy = 0; dy < cellH; dy++) {
      const rowStart = (cy + dy) * W + cx;
      buf32.fill(color, rowStart, rowStart + cellW);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Vignette: single composite fill over the finished pixel buffer.
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

/* ─────────────────────────────────────────────────────────────
   LOOP
   setTimeout (not rAF — unavailable in Workers).
   Checking every ~16 ms lets us hit the 30 fps draw cap and the
   200 ms step interval accurately without burning extra CPU.
   When the tab is backgrounded the browser throttles setTimeout
   automatically — perfect behaviour for a background effect.
───────────────────────────────────────────────────────────── */
function loop() {
  const now = performance.now();

  if (now - lastStep >= STEP_MS) {
    step();
    lastStep = now;
  }
  if (now - lastDraw >= FRAME_MS) {
    draw();
    lastDraw = now;
  }

  setTimeout(loop, 16);
}

/* ─────────────────────────────────────────────────────────────
   MESSAGE HANDLER
───────────────────────────────────────────────────────────── */
self.onmessage = ({ data }) => {
  if (data.type === "init") {
    canvas = data.canvas; // OffscreenCanvas ownership transferred
    ctx = canvas.getContext("2d");
    resize(data.width, data.height);
    loop();
  } else if (data.type === "resize") {
    resize(data.width, data.height);
  }
};
