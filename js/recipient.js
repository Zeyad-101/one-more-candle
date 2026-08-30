import { renderCake } from "./cake.js";
import { renderScrapbook } from "./scrapbook.js";
import { burstConfetti } from "./confetti.js";
import { escapeHtml } from "./util.js";

function goToStage(name) {
  document.querySelectorAll(".stage").forEach((el) => el.classList.remove("active"));
  document.getElementById(`stage-${name}`).classList.add("active");
}

export function mountRecipientExperience(rootEl, gift) {
  rootEl.classList.add("scene", `theme-${gift.background_theme}`);
  rootEl.innerHTML = `
    <div class="sparkle-layer" id="sparkles"></div>

    <section class="stage active" id="stage-intro">
      <p class="omc-title" style="font-size:1.5rem;">Hey, ${escapeHtml(gift.friend_name)}...</p>
      <p style="color:rgba(255,248,240,0.7); max-width:320px;">${escapeHtml(gift.intro_text) || "I made something for you."}</p>
      <button class="omc-btn" id="btn-open">Open it</button>
    </section>

    <section class="stage" id="stage-discover">
      <p class="omc-title" id="wish-text" style="font-size:1.25rem; opacity:0; transition:opacity 0.4s;">Make a wish...</p>
      <div id="cake-container"></div>
      <p id="tap-hint" style="font-size:0.85rem; color:rgba(255,248,240,0.6); opacity:0; transition:opacity 0.4s;">tap the candle</p>
    </section>

    <section class="stage" id="stage-surprise">
      <h1 class="omc-title" style="font-size:2.4rem; line-height:1.2;">
        HAPPY BIRTHDAY,<br />${escapeHtml(gift.friend_name).toUpperCase()}! 🎂
      </h1>
      <button class="omc-btn mint" id="btn-memories">Our Memories →</button>
    </section>

    <section class="stage" id="stage-memories">
      <h2 class="omc-title" style="font-size:1.8rem;">Our Memories</h2>
      <div id="scrapbook-container"></div>
      <button class="omc-btn" id="btn-message">Continue →</button>
    </section>

    <section class="stage" id="stage-message" style="max-width:420px;">
      <p style="color:rgba(255,248,240,0.7);">And that's only a few of our memories...</p>
      <h2 class="omc-title" style="color:var(--omc-raspberry); font-size:1.8rem;">Happy Birthday ❤️</h2>
      <p style="line-height:1.6;">${escapeHtml(gift.message)}</p>
      ${gift.closing_line ? `<p class="omc-title" style="opacity:0.8;">${escapeHtml(gift.closing_line)}</p>` : ""}
    </section>
  `;

  // sparkles
  const sparkleLayer = rootEl.querySelector("#sparkles");
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    const size = 2 + (i % 3);
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.top = `${(i * 37) % 90}%`;
    s.style.left = `${(i * 53) % 95}%`;
    s.style.animationDuration = `${2.5 + (i % 4)}s`;
    s.style.animationDelay = `${i * 0.2}s`;
    sparkleLayer.appendChild(s);
  }

  document.getElementById("btn-open").addEventListener("click", () => {
    goToStage("discover");
    mountCake();
  });

  function mountCake() {
    const cakeContainer = document.getElementById("cake-container");
    const wishText = document.getElementById("wish-text");
    const tapHint = document.getElementById("tap-hint");

    const { shakeElement } = renderCake(
      cakeContainer,
      { flavor: gift.flavor, creamStyle: gift.cream_style, candleStyle: gift.candle_style },
      {
        onLanded: () => {
          wishText.style.opacity = "1";
          tapHint.style.opacity = "0.6";
        },
        onCandleOut: () => {
          shakeElement.classList.add("cake-shake");
          setTimeout(() => {
            goToStage("surprise");
            burstConfetti();
          }, 500);
        },
      }
    );
  }

  document.getElementById("btn-memories").addEventListener("click", () => {
    goToStage("memories");
    renderScrapbook(document.getElementById("scrapbook-container"), gift.photos);
  });

  document.getElementById("btn-message").addEventListener("click", () => {
    goToStage("message");
  });
}
