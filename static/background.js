(() => {
  const SIDE = 45;
  const ROW_HEIGHT = SIDE * Math.sqrt(3) / 2;
  const PERIOD_SECONDS = 120;
  const THRESHOLD_MID = 0.5;
  const THRESHOLD_AMP = 0.5;
  const FADE_HALF_WIDTH = 0.08;
  const BOLD_LEVELS = 12;

  // Stroke colors are read from CSS custom properties (`--lattice-thin`,
  // `--lattice-bold`) so the lattice retints in sync with the theme.
  let thinStroke = "rgba(56, 110, 224, 0.06)";
  let boldStroke = "rgba(56, 110, 224, 0.10)";

  function readStrokes() {
    const styles = getComputedStyle(document.documentElement);
    const thin = styles.getPropertyValue("--lattice-thin").trim();
    const bold = styles.getPropertyValue("--lattice-bold").trim();
    if (thin) thinStroke = thin;
    if (bold) boldStroke = bold;
  }

  let canvas;
  let ctx;
  let dpr = 1;
  let edges = [];
  let rafId = null;
  let resizeTimer = null;
  const buckets = [];
  for (let i = 0; i < BOLD_LEVELS; i++) buckets.push([]);

  function smoothstep01(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return x * x * (3 - 2 * x);
  }

  function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "-1",
      pointerEvents: "none",
    });
    document.body.prepend(canvas);
    ctx = canvas.getContext("2d");
  }

  function sizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildLattice() {
    edges = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pad = SIDE;
    const jMin = Math.floor(-pad / ROW_HEIGHT);
    const jMax = Math.ceil((h + pad) / ROW_HEIGHT);
    for (let j = jMin; j <= jMax; j++) {
      const y = j * ROW_HEIGHT;
      const xOffset = (j & 1) ? SIDE / 2 : 0;
      const iMin = Math.floor((-pad - xOffset) / SIDE);
      const iMax = Math.ceil((w + pad - xOffset) / SIDE);
      for (let i = iMin; i <= iMax; i++) {
        const x = i * SIDE + xOffset;
        const xRight = x + SIDE;
        const xDownRight = x + SIDE / 2;
        const xDownLeft = x - SIDE / 2;
        const yDown = y + ROW_HEIGHT;
        edges.push({ x1: x, y1: y, x2: xRight, y2: y, r: Math.random() });
        edges.push({ x1: x, y1: y, x2: xDownRight, y2: yDown, r: Math.random() });
        edges.push({ x1: x, y1: y, x2: xDownLeft, y2: yDown, r: Math.random() });
      }
    }
  }

  function draw() {
    rafId = null;
    if (document.hidden) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const t = performance.now() / 1000;
    const threshold = THRESHOLD_MID + THRESHOLD_AMP * Math.sin((2 * Math.PI * t) / PERIOD_SECONDS);

    ctx.lineCap = "round";

    ctx.beginPath();
    for (let k = 0; k < edges.length; k++) {
      const e = edges[k];
      ctx.moveTo(e.x1, e.y1);
      ctx.lineTo(e.x2, e.y2);
    }
    ctx.strokeStyle = thinStroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i < BOLD_LEVELS; i++) buckets[i].length = 0;
    for (let k = 0; k < edges.length; k++) {
      const e = edges[k];
      const b = smoothstep01((threshold - e.r) / (2 * FADE_HALF_WIDTH) + 0.5);
      if (b > 0) {
        const idx = Math.min(BOLD_LEVELS - 1, Math.floor(b * BOLD_LEVELS));
        buckets[idx].push(e);
      }
    }
    ctx.strokeStyle = boldStroke;
    ctx.lineWidth = 2;
    for (let i = 0; i < BOLD_LEVELS; i++) {
      const bucket = buckets[i];
      if (bucket.length === 0) continue;
      ctx.globalAlpha = (i + 1) / BOLD_LEVELS;
      ctx.beginPath();
      for (let k = 0; k < bucket.length; k++) {
        const e = bucket[k];
        ctx.moveTo(e.x1, e.y1);
        ctx.lineTo(e.x2, e.y2);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    schedule();
  }

  function schedule() {
    if (rafId === null && !document.hidden) {
      rafId = requestAnimationFrame(draw);
    }
  }

  function onResize() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      sizeCanvas();
      buildLattice();
      schedule();
    }, 120);
  }

  function onVisibilityChange() {
    if (!document.hidden) schedule();
  }

  function onThemeChange() {
    readStrokes();
    schedule();
  }

  function init() {
    createCanvas();
    sizeCanvas();
    readStrokes();
    buildLattice();
    schedule();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("themechange", onThemeChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
