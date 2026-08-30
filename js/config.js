// Cake preset options — kept as plain data so creator.js and recipient.js
// both read from a single source of truth.

export const FLAVOR_OPTIONS = {
  chocolate: { label: "Chocolate", color: "#6B4226" },
  vanilla: { label: "Vanilla", color: "#F3E5AB" },
  strawberry: { label: "Strawberry", color: "#F7B5C3" },
};

export const CREAM_OPTIONS = {
  classic: "Classic Swoop",
  drip: "Chocolate Drip",
  swirl: "Piped Swirl",
};

export const BACKGROUND_OPTIONS = {
  sunset: "Sunset",
  night: "Starry Night",
  pastel: "Soft Pastel",
};

export const CANDLE_OPTIONS = {
  classic: "Classic",
  spiral: "Spiral",
  star: "Star Topper",
};

// Mock gift used by demo.html so the recipient experience can be built and
// tested before the creator form / Supabase wiring exists.
export const mockGift = {
  id: "demo",
  friend_name: "Sara",
  intro_text: "I made something for you.",
  flavor: "strawberry",
  cream_style: "swirl",
  background_theme: "sunset",
  candle_style: "star",
  message:
    "Another year of you being exactly the kind of chaotic, wonderful friend the group chat doesn't deserve. Thank you for every late-night call and every terrible decision we made together on purpose.",
  closing_line: "Here's to making more memories.",
  photos: [
    { url: "https://placehold.co/400x400/FF9166/241E4E?text=Us+%231", caption: "That one road trip" },
    { url: "https://placehold.co/400x500/8FD9B6/241E4E?text=Us+%232", caption: "Your terrible haircut era" },
    { url: "https://placehold.co/400x400/FF6F91/FFF8F0?text=Us+%233", caption: "3am diner run" },
    { url: "https://placehold.co/400x450/FFE8C7/241E4E?text=Us+%234", caption: "Graduation day" },
    { url: "https://placehold.co/400x400/241E4E/FFE8C7?text=Us+%235" },
  ],
};
