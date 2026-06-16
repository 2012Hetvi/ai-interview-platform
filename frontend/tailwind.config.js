/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14132B',        // deep indigo-black - sidebar / headings
        paper: '#F7F6F2',      // warm off-white - page background
        signal: {
          DEFAULT: '#5B5FEF',  // electric indigo - primary actions / AI accent
          dark: '#4548C9',
          light: '#EEF0FF',
        },
        pulse: {
          DEFAULT: '#2BB673',  // success green - good scores / accepted
          light: '#E5F7EE',
        },
        caution: {
          DEFAULT: '#F2994A',  // amber - needs improvement
          light: '#FDF1E6',
        },
        danger: {
          DEFAULT: '#E15554',
          light: '#FCEAEA',
        },
        slate: {
          50: '#F8F9FB',
          100: '#EEF0F4',
          200: '#DFE2E8',
          400: '#9097A6',
          600: '#6B7280',
          800: '#2D3142',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 19, 43, 0.04), 0 4px 16px rgba(20, 19, 43, 0.06)',
      },
    },
  },
  plugins: [],
}
