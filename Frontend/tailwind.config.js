/** @type {import('tailwindcss').Config} */
// TailwindCSS configuration file - defines design system and styling rules
export default {
  // Specify which files Tailwind should scan for class names
  content: [
    "./index.html", // Scan main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS/JSX files in src directory
  ],

  // Theme configuration - customize colors, fonts, spacing, etc.
  theme: {
    extend: {
      // Custom colors for our e-commerce brand
      colors: {
        // Primary brand colors
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Main primary color
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Secondary/accent colors
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b", // Main secondary color
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },

      // Custom font families
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
      },

      // Custom spacing values
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // Custom border radius values
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },

  // Plugins for additional functionality
  plugins: [
    // Add any TailwindCSS plugins here if needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
