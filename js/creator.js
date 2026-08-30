import {
  FLAVOR_OPTIONS,
  CREAM_OPTIONS,
  BACKGROUND_OPTIONS,
  CANDLE_OPTIONS,
} from "./config.js";
import { mountRecipientExperience } from "./recipient.js";
import { supabase } from "./supabaseClient.js";
import { nanoid } from "https://cdn.jsdelivr.net/npm/nanoid@5/nanoid.js";

const PRESET_GROUPS = [
  { key: "flavor", label: "Flavor", options: FLAVOR_OPTIONS },
  { key: "cream_style", label: "Cream style", options: CREAM_OPTIONS },
  { key: "background_theme", label: "Background", options: BACKGROUND_OPTIONS },
  { key: "candle_style", label: "Candle", options: CANDLE_OPTIONS },
];

const DEFAULTS = {
  flavor: "chocolate",
  cream_style: "classic",
  background_theme: "sunset",
  candle_style: "classic",
};

// Single source of truth for live form state.
const state = {
  friend_name: "",
  intro_text: "",
  ...DEFAULTS,
  message: "",
  closing_line: "",
  photos: [], // { url, caption, file }
};

const THEME_CLASSES = ["scene", "theme-sunset", "theme-night", "theme-pastel"];
const BUCKET = "gift-photos";

function init() {
  renderPresetGroups();
  bindFormFields();
  bindPhotoInput();
  bindPreview();
  bindGenerate();
  bindCopy();
  bindReset();
}

// ---------- Preset chips ----------

function renderPresetGroups() {
  for (const group of PRESET_GROUPS) {
    const host = document.querySelector(`[data-preset="${group.key}"]`);
    if (!host) continue;

    host.innerHTML = "";

    const labelEl = document.createElement("p");
    labelEl.className = "preset-label";
    labelEl.textContent = group.label;
    host.appendChild(labelEl);

    const chips = document.createElement("div");
    chips.className = "preset-chips";

    for (const [value, opt] of Object.entries(group.options)) {
      const id = `${group.key}-${value}`;
      const chipLabel = document.createElement("label");
      chipLabel.className = "preset-chip";
      chipLabel.setAttribute("for", id);

      const input = document.createElement("input");
      input.type = "radio";
      input.id = id;
      input.name = group.key;
      input.value = value;
      if (state[group.key] === value) chipLabel.classList.add("selected");

      const text = document.createElement("span");
      text.textContent = typeof opt === "string" ? opt : opt.label;

      chipLabel.appendChild(input);
      chipLabel.appendChild(text);

      input.addEventListener("change", () => {
        if (!input.checked) return;
        state[group.key] = value;
        chips
          .querySelectorAll(".preset-chip")
          .forEach((c) => c.classList.remove("selected"));
        chipLabel.classList.add("selected");
      });

      chips.appendChild(chipLabel);
    }

    host.appendChild(chips);
  }
}

// ---------- Text fields ----------

function bindFormFields() {
  const form = document.getElementById("gift-form");
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (!t.name || !(t.name in state)) return;
    state[t.name] = t.value;
  });
}

// ---------- Photo upload (local) ----------

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB — reject anything larger

function bindPhotoInput() {
  const input = document.getElementById("photo-input");
  const trigger = document.getElementById("add-photos-btn");
  trigger.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    const skipped = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        skipped.push(`${file.name} (not an image)`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        skipped.push(`${file.name} (${mb}MB, max 8MB)`);
        continue;
      }
      const url = URL.createObjectURL(file);
      state.photos.push({ url, caption: "", file });
    }
    if (skipped.length > 0) {
      showStatus(`Skipped: ${skipped.join(", ")}`, "err");
    }
    input.value = ""; // allow re-selecting the same file later
    renderPhotoList();
    updatePhotoCount();
  });
}

function renderPhotoList() {
  const list = document.getElementById("photo-list");
  list.innerHTML = "";

  state.photos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "photo-item";
    item.innerHTML = `
      <img class="photo-thumb" src="${photo.url}" alt="Memory ${i + 1}" />
      <input class="photo-caption-input" type="text" placeholder="Caption (optional)" autocomplete="off" />
      <button type="button" class="photo-remove" aria-label="Remove photo">✕</button>
    `;

    const captionInput = item.querySelector(".photo-caption-input");
    captionInput.value = photo.caption;
    captionInput.addEventListener("input", () => {
      photo.caption = captionInput.value;
    });

    item
      .querySelector(".photo-remove")
      .addEventListener("click", () => removePhoto(i));

    list.appendChild(item);
  });
}

function removePhoto(index) {
  const photo = state.photos[index];
  if (!photo) return;
  URL.revokeObjectURL(photo.url);
  state.photos.splice(index, 1);
  renderPhotoList();
  updatePhotoCount();
}

function updatePhotoCount() {
  const el = document.getElementById("photo-count");
  const n = state.photos.length;
  el.textContent = n === 0 ? "No photos yet" : `${n} photo${n === 1 ? "" : "s"}`;
}

// ---------- Preview ----------

function bindPreview() {
  document.getElementById("preview-btn").addEventListener("click", () => {
    if (!validateRequired()) return;

    const previewRoot = document.getElementById("preview-root");
    const stage = document.getElementById("preview-stage");
    const gift = buildGift();

    stage.classList.remove(...THEME_CLASSES);
    stage.innerHTML = "";

    mountRecipientExperience(stage, gift);

    previewRoot.hidden = false;
    document.body.style.overflow = "hidden";
  });

  document.getElementById("preview-close").addEventListener("click", closePreview);
  document.addEventListener("keydown", onPreviewKey);
}

function closePreview() {
  const previewRoot = document.getElementById("preview-root");
  const stage = document.getElementById("preview-stage");
  stage.classList.remove(...THEME_CLASSES);
  stage.innerHTML = "";
  previewRoot.hidden = true;
  document.body.style.overflow = "";
}

function onPreviewKey(e) {
  if (e.key === "Escape") closePreview();
}

// ---------- Generate (real) ----------

function bindGenerate() {
  document.getElementById("generate-btn").addEventListener("click", onGenerate);
}

async function onGenerate() {
  if (!validateRequired()) return;

  const generateBtn = document.getElementById("generate-btn");
  const previewBtn = document.getElementById("preview-btn");
  const originalText = generateBtn.textContent;

  setBusy(generateBtn, previewBtn, true, "Generating…");

  try {
    const giftId = nanoid(10);

    const uploadedPhotos = await uploadPhotos(giftId);

    const gift = {
      id: giftId,
      friend_name: state.friend_name.trim(),
      intro_text: state.intro_text.trim() || null,
      flavor: state.flavor,
      cream_style: state.cream_style,
      background_theme: state.background_theme,
      candle_style: state.candle_style,
      message: state.message.trim(),
      closing_line: state.closing_line.trim() || null,
      photos: uploadedPhotos,
    };

    showStatus("Saving gift…", "ok");

    const { error: insertError } = await supabase
      .from("gifts")
      .insert(gift);

    if (insertError) {
      throw new Error(insertError.message || "Failed to save gift.");
    }

    showSuccessCard(giftId);
  } catch (err) {
    showStatus(err.message || "Something went wrong. Please try again.", "err");
  } finally {
    setBusy(generateBtn, previewBtn, false, originalText);
  }
}

async function uploadPhotos(giftId) {
  if (state.photos.length === 0) return [];

  showStatus(
    `Uploading photos… (0 / ${state.photos.length})`,
    "ok"
  );

  const total = state.photos.length;
  let done = 0;

  const results = await Promise.all(
    state.photos.map(async (p, i) => {
      // Compress to a sane upload size (longest side ≤ 1600px, JPEG @ 0.8).
      // The original File stays in state for the live Preview object URL —
      // we only produce a smaller copy for the actual upload.
      const uploadFile = await compressImage(p.file);
      const safeName = (uploadFile?.name || `photo-${i}.jpg`).replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );
      const path = `${giftId}/${i}-${safeName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, uploadFile, { upsert: true, contentType: uploadFile.type });

      if (error) {
        throw new Error(`Photo upload failed: ${error.message}`);
      }

      const { data: pub } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      done += 1;
      showStatus(`Uploading photos… (${done} / ${total})`, "ok");

      return { url: pub.publicUrl, caption: p.caption.trim() || null };
    })
  );

  return results;
}

// Client-side photo compression: cap longest side at 1600px and re-encode
// as JPEG @ 0.8. Keeps the original File object around for object URLs
// (Preview) — this just returns a fresh, smaller File for the upload step.
// If the file is already small enough (or the browser can't decode it),
// the original is returned unchanged so we never make things worse.
async function compressImage(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = url;
    });
    const maxSide = 1600;
    const longest = Math.max(img.width, img.height);
    if (longest <= maxSide) return file; // already small enough

    const scale = maxSide / longest;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8);
    });
    if (!blob) return file; // toBlob failed — fall back to original

    // Match the new content type — swap the extension to .jpg.
    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file; // anything goes wrong, just upload the original
  } finally {
    URL.revokeObjectURL(url);
  }
}

function setBusy(generateBtn, previewBtn, busy, generateText) {
  generateBtn.disabled = busy;
  previewBtn.disabled = busy;
  generateBtn.classList.toggle("is-loading", busy);
  generateBtn.textContent = generateText;
}

// ---------- Success / copy / reset ----------

function showSuccessCard(giftId) {
  const shareLink = `${location.origin}/gift.html?id=${giftId}`;
  const linkInput = document.getElementById("share-link");
  linkInput.value = shareLink;

  document.getElementById("gift-form").hidden = true;
  document.querySelector(".creator-header").hidden = true;
  document.getElementById("success-card").hidden = false;

  document.getElementById("status-msg").textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindCopy() {
  document.getElementById("copy-btn").addEventListener("click", async () => {
    const btn = document.getElementById("copy-btn");
    const link = document.getElementById("share-link").value;
    const original = btn.textContent;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.getElementById("share-link");
        input.select();
        document.execCommand("copy");
      }
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = original;
      }, 1800);
    } catch (err) {
      showStatus("Couldn't copy. Long-press the link to copy manually.", "err");
    }
  });
}

function bindReset() {
  document.getElementById("reset-btn").addEventListener("click", () => {
    // Revoke object URLs
    for (const p of state.photos) URL.revokeObjectURL(p.url);

    // Reset state
    state.friend_name = "";
    state.intro_text = "";
    state.message = "";
    state.closing_line = "";
    Object.assign(state, DEFAULTS);
    state.photos = [];

    // Reset DOM
    document.getElementById("gift-form").reset();
    renderPresetGroups();
    renderPhotoList();
    updatePhotoCount();

    // Toggle views
    document.getElementById("success-card").hidden = true;
    document.getElementById("gift-form").hidden = false;
    document.querySelector(".creator-header").hidden = false;

    document.getElementById("status-msg").textContent = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ---------- Build / validate / status ----------

function buildGift() {
  return {
    friend_name: state.friend_name.trim(),
    intro_text: state.intro_text.trim() || null,
    flavor: state.flavor,
    cream_style: state.cream_style,
    background_theme: state.background_theme,
    candle_style: state.candle_style,
    message: state.message.trim(),
    closing_line: state.closing_line.trim() || null,
    photos: state.photos.map((p) => ({
      url: p.url,
      caption: p.caption.trim() || null,
    })),
  };
}

function validateRequired() {
  if (!state.friend_name.trim()) {
    showStatus("Friend's name is required.", "err");
    focusField("friend_name");
    return false;
  }
  if (!state.message.trim()) {
    showStatus("Message is required.", "err");
    focusField("message");
    return false;
  }
  return true;
}

function focusField(name) {
  const el = document.querySelector(`[name="${name}"]`);
  if (!el) return;
  el.focus();
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showStatus(text, kind) {
  const el = document.getElementById("status-msg");
  el.textContent = text;
  el.dataset.kind = kind || "ok";
}

init();