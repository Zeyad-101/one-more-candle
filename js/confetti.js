const PALETTE = ["#FF6F91", "#FF9166", "#FFE8C7", "#8FD9B6", "#FFF8F0"];

export function burstConfetti() {
  if (typeof confetti !== "function") return; // CDN script not loaded, fail quietly

  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0, y: 0.6 }, colors: PALETTE, scalar: 0.9 });
    confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1, y: 0.6 }, colors: PALETTE, scalar: 0.9 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 }, colors: PALETTE, startVelocity: 45 });
}
