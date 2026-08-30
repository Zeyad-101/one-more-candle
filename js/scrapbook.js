import { escapeHtml } from "./util.js";

export function renderScrapbook(container, photos) {
  container.innerHTML = `
    <div class="scrapbook" id="scrapbook-grid"></div>
    <div class="photo-modal" id="photo-modal">
      <div class="photo-modal-card" id="photo-modal-card">
        <img id="photo-modal-img" src="" alt="" />
        <p class="photo-modal-caption" id="photo-modal-caption"></p>
        <button class="photo-modal-close" id="photo-modal-close">close</button>
      </div>
    </div>
  `;

  const grid = container.querySelector("#scrapbook-grid");
  const modal = container.querySelector("#photo-modal");
  const modalCard = container.querySelector("#photo-modal-card");
  const modalImg = container.querySelector("#photo-modal-img");
  const modalCaption = container.querySelector("#photo-modal-caption");
  const modalClose = container.querySelector("#photo-modal-close");

  photos.forEach((photo, i) => {
    const card = document.createElement("button");
    card.className = `photo-card entrance-${i % 5}`;
    card.style.animationDelay = `${i * 0.15}s`;
    card.style.setProperty("--rot", "0deg");
    card.innerHTML = `
      <img src="${photo.url}" alt="${escapeHtml(photo.caption) || "memory"}" loading="lazy" />
      ${photo.caption ? `<span class="photo-caption">${escapeHtml(photo.caption)}</span>` : ""}
    `;
    card.addEventListener("click", () => {
      modalImg.src = photo.url;
      modalImg.alt = photo.caption || "memory";
      modalCaption.textContent = photo.caption || "";
      modalCaption.style.display = photo.caption ? "block" : "none";
      modal.classList.add("active");
    });
    grid.appendChild(card);
  });

  function closeModal() {
    modal.classList.remove("active");
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
  modalCard.addEventListener("click", (e) => e.stopPropagation());
}
