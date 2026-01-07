/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Postcard-inspired color palette
        postcard: {
          // Red tones (traditional postal red)
          red: {
            DEFAULT: '#C41E3A',
            light: '#DC143C',
            dark: '#A01828',
            bright: '#EF4444',
            lighter: '#F87171',
          },
          // Blue tones (traditional postal blue)
          blue: {
            DEFAULT: '#003087',
            light: '#1E40AF',
            dark: '#002060',
            bright: '#3B82F6',
            lighter: '#60A5FA',
            sky: '#0EA5E9',
          },
          // Neutral tones
          black: {
            DEFAULT: '#0A0A0A',
            text: '#1A1A1A',
            soft: '#2A2A2A',
          },
          cream: {
            DEFAULT: '#FFFAF0',
            light: '#FFFEF8',
            dark: '#FFF8F0',
          },
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
          // Dark mode specific
          night: {
            bg: '#0F0F14',
            surface: '#1A1A24',
            border: '#404050',
            text: '#E5E5E5',
            muted: '#A0A0A8',
          },
        },
      },
      backgroundImage: {
        'postcard-gradient': 'linear-gradient(135deg, #FFFAF0 0%, #FFF8F0 100%)',
        'postcard-gradient-dark': 'linear-gradient(135deg, #0F0F14 0%, #1A1A24 100%)',
        'red-gradient': 'linear-gradient(135deg, #C41E3A 0%, #DC143C 100%)',
        'blue-gradient': 'linear-gradient(135deg, #003087 0%, #1E40AF 100%)',
        'red-gradient-dark': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        'blue-gradient-dark': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      },
      boxShadow: {
        'postcard': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'postcard-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'postcard-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'postcard-dark-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'modern': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'modern-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'modern': '12px',
        'modern-lg': '16px',
        'modern-xl': '20px',
        'modern-2xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
