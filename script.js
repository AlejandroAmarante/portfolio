/* ═══════════════════════════════════════════════════════════════
   script.js
   Key changes vs. previous version:
   • Cellular Fade simulation moved to cell-worker.js via
     OffscreenCanvas — simulation + render run entirely off the
     main thread, eliminating any scroll / interaction jank.
   • Render rate capped at 30 fps inside the worker (was 60 fps).
   • Resize events debounced (150 ms) before messaging the worker.
   • Renamed initGoL → initCellularFade throughout.
   • Cursor ring: skips DOM write when position has converged.
   • Tooltip mousemove: rAF-gated so layout is touched ≤ once/frame.
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
  let rx = mx,
    ry = my;

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
      rx = lerp(rx, mx, 0.2);
      ry = lerp(ry, my, 0.2);
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
   3. CELLULAR FADE
   The entire simulation + render loop lives in cell-worker.js and
   runs on a dedicated Worker thread via OffscreenCanvas.  The main
   thread only sends two types of messages:
     { type: 'init',   canvas: OffscreenCanvas, width, height }
     { type: 'resize', width, height }

   OffscreenCanvas is supported in all modern browsers (Chrome 69+,
   Firefox 105+, Safari 17+).  On very old browsers the canvas is
   hidden and the page renders without the background effect.
───────────────────────────────────────────────────────────── */
(function initCellularFade() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  if (typeof OffscreenCanvas === "undefined" || typeof Worker === "undefined") {
    // Legacy browser — hide canvas gracefully, page still fully usable.
    canvas.style.display = "none";
    return;
  }

  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker("cell-worker.js");

  worker.postMessage(
    { type: "init", canvas: offscreen, width: innerWidth, height: innerHeight },
    [offscreen], // transfer ownership — zero-copy
  );

  // Debounce resize so we don't flood the worker during drag-resize.
  let resizeTimer;
  addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        worker.postMessage({
          type: "resize",
          width: innerWidth,
          height: innerHeight,
        });
      }, 150);
    },
    { passive: true },
  );
})();

/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL
───────────────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
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
        tooltip.style.transform = `translate(${pendingX + 10}px,${pendingY - 10}px)`;
        rafScheduled = false;
      });
    }
  });

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      clearTimeout(hideTimer);
      tooltip.classList.add("visible");
      hideTimer = setTimeout(() => tooltip.classList.remove("visible"), 2000);
    } catch {}
  });
})();
