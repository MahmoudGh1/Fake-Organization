/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#FAF9F6",       // Warm Ivory / Alabaster
          dark: "#1A1A1A",     // Deep Charcoal / Onyx
          muted: "#666666",    // Soft Slate Gray
          gold: "#D4AF37",     // Classic Metallic Gold
          champagne: "#F3E5AB",// Soft Warm Accent Gold
          card: "#FFFFFF",     // Pure White for clean grid separation
        }
      },
      fontFamily: {
        // High-end editorial serif paired with clean modern sans
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}