/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // ─────────────────────────────────────────────
                // BRAND CORE
                // ─────────────────────────────────────────────
                primary: '#FFDD1F',    // signature yellow — CTAs, active tab, highlights
                secondary: '#F58634',  // warm orange — accents, gradients, badges

                // ─────────────────────────────────────────────
                // STATE COLORS
                // ─────────────────────────────────────────────
                success: '#16a34a',    // present / paid / positive
                danger: '#dc2626',     // absent / unpaid / errors
                warning: '#d97706',    // pending / due-soon
                info: '#0ea5e9',       // neutral info

                // ─────────────────────────────────────────────
                // SURFACES (light mode)
                // ─────────────────────────────────────────────
                background: '#FFFFFF',     // main screen bg
                surface: '#FAFAFA',        // cards, sheets
                surfaceAlt: '#F5F5F5',     // nested cards, inputs
                border: '#EAEAEA',         // hairline dividers
                muted: '#8A8A8A',          // secondary text

                // ─────────────────────────────────────────────
                // SURFACES (dark mode) — pair with dark: prefix
                // ─────────────────────────────────────────────
                dark: {
                    bg: '#0A0A0A',
                    surface: '#141414',
                    surfaceAlt: '#1E1E1E',
                    border: '#262626',
                    muted: '#A1A1A1',
                },

                // ─────────────────────────────────────────────
                // TEXT
                // ─────────────────────────────────────────────
                ink: '#000000',        // primary text on light
                'ink-invert': '#FFFFFF', // primary text on dark / colored
            },

            // ─────────────────────────────────────────────
            // GRADIENTS — used via `bg-gradient-*` with expo-linear-gradient
            // (kept here as color stops for reference / manual use)
            // ─────────────────────────────────────────────
            backgroundImage: {
                'brand': 'linear-gradient(135deg, #FFDD1F 0%, #F58634 100%)',
                'brand-soft': 'linear-gradient(135deg, #FFF7CC 0%, #FFE3CC 100%)',
                'dark-fade': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)',
            },

            // ─────────────────────────────────────────────
            // RADII — smooth, modern corners
            // ─────────────────────────────────────────────
            borderRadius: {
                xs: '6px',
                sm: '10px',
                md: '14px',
                lg: '18px',
                xl: '24px',
                '2xl': '32px',
                pill: '999px',
            },

            // ─────────────────────────────────────────────
            // SHADOWS — soft, layered, premium feel
            // ─────────────────────────────────────────────
            boxShadow: {
                soft: '0 2px 8px rgba(0,0,0,0.06)',
                card: '0 6px 20px rgba(0,0,0,0.08)',
                lifted: '0 12px 28px rgba(0,0,0,0.12)',
                brand: '0 8px 24px rgba(245,134,52,0.35)',   // glow under yellow/orange CTAs
                yellow: '0 8px 24px rgba(255,221,31,0.45)',
            },

            // ─────────────────────────────────────────────
            // SPACING — keep 4px rhythm, add a few extras
            // ─────────────────────────────────────────────
            spacing: {
                '4.5': '18px',
                '18': '72px',
                '22': '88px',
            },

            // ─────────────────────────────────────────────
            // FONT SIZES — slightly tighter for modern look
            // ─────────────────────────────────────────────
            fontSize: {
                xs: ['11px', { lineHeight: '16px' }],
                sm: ['13px', { lineHeight: '18px' }],
                base: ['15px', { lineHeight: '22px' }],
                lg: ['17px', { lineHeight: '24px' }],
                xl: ['20px', { lineHeight: '28px' }],
                '2xl': ['24px', { lineHeight: '32px' }],
                '3xl': ['30px', { lineHeight: '38px' }],
            },

            // ─────────────────────────────────────────────
            // ANIMATIONS (for tailwind-driven micro-interactions)
            // ─────────────────────────────────────────────
            keyframes: {
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                shimmer: 'shimmer 1.5s linear infinite',
            },
        },
    },
    plugins: [],
};