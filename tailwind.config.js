/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub color tokens mapped to Tailwind
        canvas: {
          DEFAULT: 'var(--color-canvas-default)',
          subtle: 'var(--color-canvas-subtle)',
          inset: 'var(--color-canvas-inset)',
        },
        fg: {
          DEFAULT: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
        },
        accent: {
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
        },
      },
    },
  },
  plugins: [],
}
