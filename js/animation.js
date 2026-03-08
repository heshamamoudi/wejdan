import { getLang } from "./i18n.js";

let canvas, ctx;
let particles = [];
let animationFrame;
let fadeIn = 0;

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5E6A3";
const GOLD_DARK = "#B8960C";

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.opacitySpeed = (Math.random() - 0.5) * 0.01;
    this.life = Math.random() * 200 + 100;
    this.maxLife = this.life;
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
    this.opacity += this.opacitySpeed;

    if (this.opacity > 0.7) this.opacitySpeed = -Math.abs(this.opacitySpeed);
    if (this.opacity < 0.1) this.opacitySpeed = Math.abs(this.opacitySpeed);

    if (
      this.life <= 0 ||
      this.x < 0 ||
      this.x > canvasWidth ||
      this.y < 0 ||
      this.y > canvasHeight
    ) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = GOLD_LIGHT;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMonogram(time) {
  const w = canvas.drawWidth;
  const h = canvas.drawHeight;
  const isArabic = getLang() === "ar";

  const letterLeft = isArabic ? "و" : "H";
  const letterRight = isArabic ? "ه" : "W";

  const fontSize = Math.min(w * 0.18, 120);
  const ampSize = fontSize * 0.5;

  ctx.save();
  ctx.globalAlpha = Math.min(fadeIn, 1);

  // Glow effect
  const glowIntensity = 15 + Math.sin(time * 0.002) * 5;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = glowIntensity;

  // Left letter
  ctx.font = `bold ${fontSize}px ${isArabic ? "Tajawal" : "Playfair Display"}`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerY = h * 0.45;
  const spacing = Math.min(w * 0.2, 140);

  // Animate letters sliding in
  const slideProgress = Math.min(fadeIn * 1.5, 1);
  const eased = 1 - Math.pow(1 - slideProgress, 3);
  const leftX = w / 2 - spacing * eased;
  const rightX = w / 2 + spacing * eased;

  ctx.fillText(letterLeft, leftX, centerY);
  ctx.fillText(letterRight, rightX, centerY);

  // Ampersand
  ctx.font = `${ampSize}px "Playfair Display"`;
  ctx.fillStyle = GOLD_LIGHT;
  ctx.shadowBlur = glowIntensity * 0.7;
  const ampOpacity = Math.max(0, (fadeIn - 0.5) * 2);
  ctx.globalAlpha = ampOpacity;
  ctx.fillText("&", w / 2, centerY);

  // Names below
  const nameSize = Math.min(w * 0.045, 28);
  ctx.font = `${nameSize}px ${isArabic ? "Tajawal" : "Playfair Display"}`;
  ctx.fillStyle = GOLD_DARK;
  ctx.globalAlpha = Math.max(0, (fadeIn - 0.8) * 5);
  ctx.shadowBlur = 0;

  const namesText = isArabic ? "هشام & وجدان" : "Hesham & Wejdan";
  ctx.fillText(namesText, w / 2, centerY + fontSize * 0.7);

  ctx.restore();
}

function animate(time) {
  const w = canvas.drawWidth;
  const h = canvas.drawHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  particles.forEach((p) => {
    p.update(w, h);
    p.draw(ctx);
  });

  // Fade in over 2 seconds
  if (fadeIn < 1.5) fadeIn += 0.008;

  drawMonogram(time);
  animationFrame = requestAnimationFrame(animate);
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  ctx.scale(dpr, dpr);

  // Reset canvas dimensions for drawing (use CSS pixels)
  canvas.drawWidth = rect.width;
  canvas.drawHeight = rect.height;
}

export function initAnimation(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d");

  resizeCanvas();

  // Create particles
  particles = [];
  const count = Math.min(Math.floor(canvas.drawWidth * 0.15), 80);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(canvas.drawWidth, canvas.drawHeight));
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    particles.forEach((p) => p.reset(canvas.drawWidth, canvas.drawHeight));
  });

  animate(0);
}

export function restartAnimation() {
  fadeIn = 0;
}
