# Red Zone Store — website mock

An animated demo site for Red Zone Store (PlayStation games, Minya el-Qamh, Egypt). It is for showing to the client, so it is frontend only. All products, prices and reviews are placeholder data.

## Stack

React 19, Vite, TypeScript, Tailwind v4, Motion, React Three Fiber, Lenis and Zustand. The UI is bilingual: Arabic (RTL, the default) and English.

## Develop

```bash
cd site
npm install
npm run dev
```

## Pages

- `/`: landing page with a 3D hero, a primary/secondary slot explainer, the pinned QR delivery story, deals, PS Plus, reviews and FAQ
- `/games`: catalog with platform, account-type and genre filters
- `/game/:id`: product page with a slot picker and add to cart
- `/checkout`: mock payment (Vodafone Cash, InstaPay, Fawry, card)
- `/order/:id`: simulated QR login delivery tracker

## Deploy (Vercel Git integration)

1. On vercel.com, choose **Add New → Project** and import the GitHub repo.
2. Set **Root Directory** to `site`. Vercel detects Vite, so the build command is `npm run build` and the output folder is `dist`.
3. Click **Deploy**. After that, every push to `main` redeploys production, and every other branch or PR gets a preview URL.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck and build on each push and PR.

## Brand palette (extracted from logo + banner)

| Token | Hex |
|---|---|
| void | `#050001` |
| blood | `#280000` |
| red-500 | `#ff1a1a` |
| red-600 | `#e50000` |
| red-800 | `#8c0001` |
| ice-300 | `#bdc9e7` |
| dusk-700 | `#4c3855` |
