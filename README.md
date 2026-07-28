# Erdmann – One-Page (Blyb-style)

Minimal one-pager inspired by [blyb.co](https://blyb.co): full-screen hero with centered logo, smooth scroll, and a dark green narrative section titled **das Menü steht**.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Customize

| Asset / copy | Location |
|--------------|----------|
| Hero photo | Replace [`public/hero.png`](public/hero.png) |
| Logo | Original-**SVG** unverändert als [`public/logo.svg`](public/logo.svg) – Hero: `<img src="/logo.svg">` (kein PNG/JPG) |
| Ticker & CTAs | [`index.html`](index.html) |
| Colors & layout | [`src/styles/global.css`](src/styles/global.css) |
| Scroll & reveals | [`src/main.ts`](src/main.ts) |

## Stack

- [Vite](https://vite.dev/)
- [Lenis](https://lenis.darkroom.engineering/) – smooth scrolling
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) – subtle hero scale on scroll

Animations respect `prefers-reduced-motion`.

## Deploy on Vercel

### Option A: Vercel CLI (schnell)

```bash
cd /Users/leasarchinger/Documents/Design/2026/Erdmann_website
npm install
npx vercel login    # einmalig
npx vercel          # Preview-URL
npx vercel --prod   # Live-Production-URL
```

Vercel erkennt Vite automatisch; [`vercel.json`](vercel.json) setzt Build (`npm run build`) und Output (`dist`).

### Option B: GitHub + Vercel Dashboard

1. Repository auf GitHub anlegen und Code pushen.
2. Auf [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
3. Projekt wählen, Framework **Vite** (oder Defaults aus `vercel.json`).
4. **Deploy** – bei jedem Push auf `main` wird neu gebaut.

Keine Umgebungsvariablen nötig (statische Site).

