/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      // ─── Paleta SonriApp ────────────────────────────────────────────────────
      colors: {
        primary: {
          50:  '#EDF7F8',
          100: '#C5E9EC',
          200: '#8DD0D6',
          300: '#55B8BF',
          400: '#2AA0A9',
          500: '#0E7C86',
          600: '#0B6570',
          700: '#094E58',
          800: '#063740',
          900: '#042028',
          DEFAULT: '#0E7C86',
        },
        secondary: {
          50:  '#E6FAF9',
          100: '#C0F1EE',
          200: '#8AE5DF',
          300: '#6FDBD5',
          400: '#5ECFCA',
          500: '#4FD1C5',
          600: '#3DBDB1',
          700: '#2EA299',
          800: '#208880',
          900: '#126E67',
          DEFAULT: '#4FD1C5',
        },
        success: {
          50:  '#E8F8EF',
          100: '#C5EDDA',
          200: '#8EDDB5',
          300: '#57CE90',
          400: '#3ED581',
          500: '#2ECC71',
          600: '#25A55B',
          700: '#1C7E46',
          800: '#135730',
          900: '#0A3019',
          DEFAULT: '#2ECC71',
        },
        warning: {
          50:  '#FEF7E8',
          100: '#FDEAC4',
          200: '#FBD58A',
          300: '#F9BF50',
          400: '#F7B23A',
          500: '#F5A623',
          600: '#C9861B',
          700: '#9D6513',
          800: '#71450B',
          900: '#452504',
          DEFAULT: '#F5A623',
        },
        danger: {
          50:  '#FEECEB',
          100: '#FAC9C6',
          200: '#F59590',
          300: '#F0615A',
          400: '#EA5547',
          500: '#E74C3C',
          600: '#CB3628',
          700: '#A2291F',
          800: '#7A1D16',
          900: '#51100D',
          DEFAULT: '#E74C3C',
        },
        light: '#F7FAFA',
        dark:  '#1F2A30',
      },

      // ─── Tipografía ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Escala semántica mobile-first (desktop usa sm:/md: prefix en templates)
        'display':  ['1.75rem',  { lineHeight: '2.125rem', fontWeight: '700' }],  // 28px h1 móvil
        'headline': ['1.375rem', { lineHeight: '1.75rem',  fontWeight: '600' }],  // 22px h2 móvil
        'title':    ['1.125rem', { lineHeight: '1.5rem',   fontWeight: '600' }],  // 18px h3/sección
        'body':     ['1rem',     { lineHeight: '1.5rem' }],                        // 16px cuerpo
        'small':    ['0.875rem', { lineHeight: '1.25rem' }],                       // 14px secundario
        'caption':  ['0.75rem',  { lineHeight: '1rem' }],                          // 12px etiquetas
      },

      // ─── Sombras de tarjeta ──────────────────────────────────────────────────
      boxShadow: {
        'card':    '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 24px 0 rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
