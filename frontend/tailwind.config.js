/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,svelte}"],
  theme: {
    extend: {
      colors: {
        // Define your new color here
        'primary': '#AE0606', // HEX
        'secondary': '#fff', // RGB
        'input': '#AE060650', // HSL
        'custom-red': 'rgba(255, 0, 0, 0.5)', // RGBA
      },
      minHeight: {
        'screen-70': '70vh',
        'screen-90': '90vh',
      },
    },
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
      serif: ["Georgia", "serif"],
      mono: ["Courier", "monospace"],
      // Add your custom font here
      custom: ["Inknut Antiqua", "serif"],
    },
  },
  plugins: [require("daisyui")],
};
