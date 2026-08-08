// Toy adversarial perturbation demo. A synthetic grayscale image (a filled
// circle on a plain background, meant to read as "class: circle") is scored
// by a simple linear classifier against two class templates. Repeatedly
// nudging every pixel a tiny step in the direction that most increases the
// "square" class score — without the image visibly changing much — flips
// the prediction. This mirrors, in miniature, how real adversarial examples
// exploit linear-ish decision boundaries in image classifiers.

(function () {
  const GRID = 28; // pixel grid resolution
  const CELL = 10; // px per grid cell on screen
  const W = GRID * CELL;
  const H = GRID * CELL;

  let canvas, ctx;
  let image = new Float32Array(GRID * GRID); // pixel values in [0,1]
  let templateCircle = new Float32Array(GRID * GRID);
  let templateSquare = new Float32Array(GRID * GRID);
  let step = 0;
  let perturbing = false;
  const EPS = 0.015;

  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function buildTemplates() {
    const cx = GRID / 2;
    const cy = GRID / 2;
    const r = GRID * 0.32;
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const idx = y * GRID + x;
        const dx = x - cx + 0.5;
        const dy = y - cy + 0.5;
        // Circle template: 1 inside radius, 0 outside.
        templateCircle[idx] = Math.sqrt(dx * dx + dy * dy) < r ? 1 : 0;
        // Square template: 1 inside a centered square of similar area.
        const half = r * 0.9;
        templateSquare[idx] =
          Math.abs(dx) < half && Math.abs(dy) < half ? 1 : 0;
      }
    }
  }

  function resetImage() {
    for (let i = 0; i < image.length; i++) {
      image[i] = templateCircle[i] * 0.9 + Math.random() * 0.06;
    }
    step = 0;
    perturbing = false;
    const toggleBtn = document.getElementById("adv-toggle");
    if (toggleBtn) toggleBtn.textContent = "start perturbing";
    updateStats();
  }

  function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function softmax2(a, b) {
    const m = Math.max(a, b);
    const ea = Math.exp(a - m);
    const eb = Math.exp(b - m);
    const sum = ea + eb;
    return [ea / sum, eb / sum];
  }

  function classify() {
    // Linear classifier: score_class = dot(image, template) / area
    const area = GRID * GRID * 0.28; // rough normalizer
    const scoreCircle = dot(image, templateCircle) / area;
    const scoreSquare = dot(image, templateSquare) / area;
    const [pCircle, pSquare] = softmax2(scoreCircle * 4, scoreSquare * 4);
    return { pCircle, pSquare };
  }

  function perturbStep() {
    // Gradient of (square score - circle score) w.r.t. each pixel is simply
    // (templateSquare - templateCircle) for this linear model. Nudge every
    // pixel a tiny amount in that direction, clipped to [0,1], so the image
    // still looks like a circle to the eye for a long time.
    for (let i = 0; i < image.length; i++) {
      const grad = templateSquare[i] - templateCircle[i];
      image[i] = Math.min(1, Math.max(0, image[i] + EPS * grad));
    }
    step++;
  }

  function updateStats() {
    const { pCircle, pSquare } = classify();
    const stepEl = document.getElementById("adv-step");
    const trueConfEl = document.getElementById("adv-true-conf");
    const predEl = document.getElementById("adv-pred");
    if (stepEl) stepEl.textContent = step.toLocaleString();
    if (trueConfEl) trueConfEl.textContent = `${(pCircle * 100).toFixed(1)}%`;
    if (predEl)
      predEl.textContent = pCircle >= pSquare ? "circle ✓" : "square ✗";
  }

  function draw() {
    const light = isLight();
    ctx.fillStyle = light ? "#fffaf3" : "#080808";
    ctx.fillRect(0, 0, W, H + 60);

    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const v = image[y * GRID + x];
        const gray = Math.round(v * 255);
        ctx.fillStyle = light
          ? `rgb(${255 - gray * 0.7}, ${245 - gray * 0.5}, ${235 - gray * 0.3})`
          : `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Confidence bars beneath the image.
    const { pCircle, pSquare } = classify();
    const barY = H + 12;
    const barMaxW = W - 100;

    ctx.font = "11px monospace";
    ctx.fillStyle = light ? "#6b6b6b" : "#aaaaaa";
    ctx.fillText("circle", 0, barY + 9);
    ctx.fillStyle = light ? "#2fa88f" : "#33d9c1";
    ctx.fillRect(58, barY, barMaxW * pCircle, 10);

    ctx.fillStyle = light ? "#6b6b6b" : "#aaaaaa";
    ctx.fillText("square", 0, barY + 27);
    ctx.fillStyle = light ? "#d94f4f" : "#ff5c5c";
    ctx.fillRect(58, barY + 18, barMaxW * pSquare, 10);
  }

  function loop() {
    if (perturbing) perturbStep();
    draw();
    updateStats();
    requestAnimationFrame(loop);
  }

  function init() {
    const holder = document.getElementById("adversarial-canvas-wrap");
    if (!holder) return;
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H + 60;
    holder.appendChild(canvas);
    ctx = canvas.getContext("2d");

    buildTemplates();
    resetImage();

    const resetBtn = document.getElementById("adv-reset");
    const toggleBtn = document.getElementById("adv-toggle");
    if (resetBtn) resetBtn.addEventListener("click", resetImage);
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        perturbing = !perturbing;
        toggleBtn.textContent = perturbing ? "pause" : "start perturbing";
      });
    }

    loop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
