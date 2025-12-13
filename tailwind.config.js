/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{ts,tsx}",
        "./context/**/*.{ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Teko', 'sans-serif'],
                tech: ['Rajdhani', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                // Fresh Cricket Green - Premium Light Theme
                cricket: {
                    // Backgrounds
                    bg: '#F8FAF5',
                    bgAlt: '#F0F5EB',
                    surface: '#FFFFFF',
                    surfaceHover: '#F5F9F2',
                    card: '#FFFFFF',
                    cardHover: '#F8FBF6',

                    // Primary Greens
                    primary: '#16A34A',
                    primaryLight: '#22C55E',
                    primaryDark: '#15803D',

                    // Secondary/Accent
                    secondary: '#059669',
                    emerald: '#10B981',
                    lime: '#84CC16',

                    // Special Colors
                    boundary: '#0EA5E9',
                    six: '#EAB308',
                    wicket: '#DC2626',
                    live: '#DC2626',

                    // Text Hierarchy
                    textPrimary: '#14532D',
                    textSecondary: '#475569',
                    textMuted: '#94A3B8',
                    textLight: '#CBD5E1',

                    // Borders & Dividers
                    border: '#E2E8F0',
                    borderLight: '#F1F5F9',
                    borderGreen: '#BBF7D0',
                },
                // Keep sports namespace for compatibility
                sports: {
                    black: '#14532D',
                    white: '#F8FAF5',
                    card: '#FFFFFF',
                    cardLight: '#FFFFFF',
                    surface: '#F0F5EB',
                    surfaceLight: '#FFFFFF',
                    primary: '#16A34A',
                    accent: '#059669',
                    danger: '#DC2626',
                    warning: '#EAB308',
                    muted: '#94A3B8',
                    text: '#14532D',
                    textDark: '#14532D',
                }
            },
            backgroundImage: {
                // Premium light gradients
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-cricket': 'linear-gradient(135deg, #F8FAF5 0%, #F0F5EB 50%, #E8F5E0 100%)',
                'gradient-green': 'linear-gradient(135deg, #16A34A 0%, #22C55E 50%, #16A34A 100%)',
                'gradient-emerald': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                'gradient-score': 'linear-gradient(180deg, rgba(22, 163, 74, 0.05) 0%, transparent 100%)',
                'mesh-cricket': `
                    radial-gradient(at 0% 0%, rgba(22, 163, 74, 0.08) 0px, transparent 50%),
                    radial-gradient(at 100% 0%, rgba(5, 150, 105, 0.05) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(132, 204, 22, 0.04) 0px, transparent 50%),
                    radial-gradient(at 0% 100%, rgba(22, 163, 74, 0.03) 0px, transparent 50%)
                `,
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 10px 40px -10px rgba(22, 163, 74, 0.15), 0 4px 15px rgba(0, 0, 0, 0.05)',
                'premium': '0 20px 50px -15px rgba(0, 0, 0, 0.1)',
                'glow-green': '0 0 30px rgba(22, 163, 74, 0.25)',
                'glow-emerald': '0 0 30px rgba(5, 150, 105, 0.25)',
                'inner-green': 'inset 0 2px 4px rgba(22, 163, 74, 0.1)',
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'score-pop': 'score-pop 0.3s ease-out',
                'slide-up': 'slide-up 0.5s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)'
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(22, 163, 74, 0.35)'
                    },
                },
                'score-pop': {
                    '0%': { transform: 'scale(1.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        }
    },
    plugins: [],
}
