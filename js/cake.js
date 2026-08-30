import { FLAVOR_OPTIONS } from "./config.js";

const CREAM = "#FFF8F0";
const CAP_H = 14; // vertical room reserved for the frosting cap above each tier body

// Two tiers stacked, each narrower than the one below it.
// Only the TOP tier carries the user-selected frosting style; the bottom
// tier gets a plain swoop so the silhouette reads cleanly. The top is
// slightly chunkier than it would be in a 3-tier cake so the proportions
// still feel balanced without the middle tier anchoring them.
const TIERS = [
  { w: 150, bodyH: 46, rx: 9, style: "creamStyle" }, // top
  { w: 220, bodyH: 54, rx: 9, style: "classic" },    // bottom
];

// Body: rounded top corners, flat sides and bottom (a tier sitting on the one below).
function bodyPath(w, bodyH, rx, capH) {
  const top = capH;
  const bottom = capH + bodyH;
  return (
    `M ${rx},${top} ` +
    `L ${w - rx},${top} ` +
    `Q ${w},${top} ${w},${top + rx} ` +
    `L ${w},${bottom} ` +
    `L 0,${bottom} ` +
    `L 0,${top + rx} ` +
    `Q 0,${top} ${rx},${top} Z`
  );
}

// Frosting cap (sits above body, slight overhang on the sides).
function capPath(w, capH) {
  return (
    `M -3,${capH} ` +
    `Q -3,3 ${w / 2},2 ` +
    `Q ${w + 3},3 ${w + 3},${capH} Z`
  );
}

// One hanging drip — starts at the cap edge, bulges down, returns.
function dripPath(w, capH, x, depth) {
  const width = w * 0.055;
  return (
    `M ${x - width},${capH} ` +
    `Q ${x - width},${capH + depth * 0.6} ${x},${capH + depth} ` +
    `Q ${x + width},${capH + depth * 0.6} ${x + width},${capH} Z`
  );
}

// Three piped dollops on top of the cap.
function swirlDollops(w) {
  const r1 = 8;
  const r2 = 10;
  const r3 = 8;
  return `
    <circle cx="${w * 0.25}" cy="7" r="${r1}" fill="${CREAM}" />
    <circle cx="${w * 0.5}" cy="4" r="${r2}" fill="${CREAM}" />
    <circle cx="${w * 0.75}" cy="7" r="${r3}" fill="${CREAM}" />
  `;
}

function tierSvg(tier, cakeColor, creamStyle) {
  const { w, bodyH, rx } = tier;
  const effectiveStyle = tier.style === "creamStyle" ? creamStyle : "classic";
  const totalH = CAP_H + bodyH;

  let frostingMarkup;
  if (effectiveStyle === "drip") {
    frostingMarkup =
      `<path d="${capPath(w, CAP_H)}" fill="${CREAM}" />` +
      dripPath(w, CAP_H, w * 0.15, 16) +
      dripPath(w, CAP_H, w * 0.36, 24) +
      dripPath(w, CAP_H, w * 0.6, 18) +
      dripPath(w, CAP_H, w * 0.8, 21);
  } else if (effectiveStyle === "swirl") {
    frostingMarkup =
      `<path d="${capPath(w, CAP_H)}" fill="${CREAM}" />` +
      swirlDollops(w);
  } else {
    // classic — chunky domed cap
    frostingMarkup = `<path d="${capPath(w, CAP_H)}" fill="${CREAM}" />`;
  }

  return `
    <svg viewBox="0 0 ${w} ${totalH}" width="${w}" style="display:block">
      <path d="${bodyPath(w, bodyH, rx, CAP_H)}" fill="${cakeColor}" />
      ${frostingMarkup}
    </svg>
  `.trim();
}

// Sequenced-build timing. With one fewer tier, the whole reveal lands in ~1.4s
// (bottom → top → candle → flame ignite).
const PIECE_DURATION_MS = 380;   // each piece falls in this many ms
const PIECE_GAP_MS = 30;         // pause between pieces
const FLAME_IGNITE_MS = 220;     // flame scale-in

/**
 * Renders the cake and candle into `container`, then sequences their
 * entrance: bottom tier → top tier → candle drops in → flame ignites.
 * Calls onLanded() once the flame is fully lit (the right moment to show
 * "make a wish" / tap hint), and onCandleOut() ~650ms after the candle is
 * tapped (matches the smoke fade).
 */
export function renderCake(container, { flavor, creamStyle, candleStyle }, { onLanded, onCandleOut }) {
  const cakeColor = (FLAVOR_OPTIONS[flavor] || FLAVOR_OPTIONS.chocolate).color;

  // DOM order is top→down: candle first (visually highest), then tiers
  // widest→last so the flex column stacks them as candle / top / bottom.
  container.innerHTML = `
    <div class="cake-wrap">
      <div class="cake-fall" id="cake-fall">
        <div class="candle" id="candle">
          <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
            <div class="flame" id="flame"></div>
            <div class="wick ${candleStyle}"></div>
          </div>
        </div>
        <div class="tier" id="tier-top">${tierSvg(TIERS[0], cakeColor, creamStyle)}</div>
        <div class="tier" id="tier-bottom">${tierSvg(TIERS[1], cakeColor, creamStyle)}</div>
      </div>
      <div class="cake-shadow" id="cake-shadow"></div>
    </div>
  `;

  const cakeFall = container.querySelector("#cake-fall");
  const shadow = container.querySelector("#cake-shadow");
  const candle = container.querySelector("#candle");
  const flame = container.querySelector("#flame");
  const bottom = container.querySelector("#tier-bottom");
  const top = container.querySelector("#tier-top");

  let blownOut = false;
  let ready = false;

  function playPiece(el, onDone) {
    el.classList.add("fall-active");
    el.addEventListener(
      "animationend",
      () => onDone && onDone(),
      { once: true }
    );
  }

  function igniteFlame() {
    flame.classList.add("ignite");
    setTimeout(() => {
      ready = true;
      onLanded && onLanded();
    }, FLAME_IGNITE_MS);
  }

  // Sequence: bottom lands → top lands → candle drops → flame lights.
  // Flattened into helper functions to keep the parens readable.
  function fallNext(el, next) {
    setTimeout(() => playPiece(el, next), PIECE_GAP_MS);
  }

  playPiece(bottom, () => {
    shadow.classList.add("landed");
    fallNext(top, () => fallNext(candle, igniteFlame));
  });

  candle.addEventListener("click", () => {
    if (!ready || blownOut) return;
    blownOut = true;
    // Stop the ignite/flicker animations so the .out transition can take over.
    flame.classList.remove("ignite");
    flame.classList.add("out");

    const puff = document.createElement("div");
    puff.className = "smoke-puff";
    candle.appendChild(puff);
    puff.addEventListener("animationend", () => puff.remove(), { once: true });

    setTimeout(() => {
      onCandleOut && onCandleOut();
    }, 650);
  });

  return { shakeElement: cakeFall };
}