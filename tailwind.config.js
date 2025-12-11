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
                sans: ['Inter', 'sans-serif'],
                display: ['Teko', 'sans-serif'],
                tech: ['Rajdhani', 'sans-serif'],
            },
            colors: {
                sports: {
                    black: '#020617',
                    white: '#F8FAFC',
                    card: '#0F172A',
                    cardLight: '#FFFFFF',
                    surface: '#1E293B',
                    surfaceLight: '#F1F5F9',
                    primary: '#10B981',
                    accent: '#06B6D4',
                    danger: '#F43F5E',
                    warning: '#F59E0B',
                    muted: '#94A3B8',
                    text: '#F8FAFC',
                    textDark: '#0F172A',
                }
            },
            backgroundImage: {
                'gradient-glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                'gradient-glow': 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px rgba(16, 185, 129, 0.5)',
                'neon-red': '0 0 10px rgba(244, 63, 94, 0.5)',
            }
        }
    },
    plugins: [],
}
