/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  // Dark mode: preparado, sin activar (Fase 4). Sin estilos dark: en componentes aún.
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Paleta SonriApp ────────────────────────────────────────────────────
      colors: {
        // primary = sky-600 (color real de la app). Escala azul Tailwind sky.
        primary: {
          50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC', 400: '#38BDF8',
          500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1', 800: '#075985', 900: '#0C4A6E',
          DEFAULT: '#0284C7',
        },
        // accent (teal) reemplaza a secondary (sin usos; eliminado).
        accent: { 50: '#F0FDFA', 100: '#CCFBF1', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', DEFAULT: '#14B8A6' },
        // Semánticos: DEFAULT = 600 (contraste AA con texto blanco).
        success: { 50: '#F0FDF4', 600: '#16A34A', 700: '#15803D', DEFAULT: '#16A34A' },
        warning: { 50: '#FFFBEB', 600: '#D97706', 700: '#B45309', DEFAULT: '#D97706' },
        danger:  { 50: '#FEF2F2', 600: '#DC2626', 700: '#B91C1C', DEFAULT: '#DC2626' },
        info:    { 50: '#F0F9FF', 600: '#0284C7', 700: '#0369A1', DEFAULT: '#0284C7' },
        // Estado de cita 'en atención' (violeta propio, no usar violet de Tailwind).
        'cita-atencion': '#7C3AED',
        // Neutros: se usa slate de Tailwind. Roles: texto slate-900 #0F172A,
        // texto secundario slate-600 #475569 (mínimo slate-500 #64748B sobre blanco),
        // fondo slate-50 #F8FAFC, superficie #FFFFFF, borde slate-200 #E2E8F0.
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

      // lg 8px inputs/botones, xl 12px tarjetas (full ya existe en Tailwind).
      borderRadius: { lg: '8px', xl: '12px' },

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
