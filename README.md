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

## Deploy (GitHub Actions to Vercel)

1. Run `npx vercel login`, then run `npx vercel link` inside `site/`. Linking creates `site/.vercel/project.json`.
2. Add these GitHub repo secrets:
   - `VERCEL_TOKEN`: create one at vercel.com/account/tokens
   - `VERCEL_ORG_ID`: the `orgId` value from `project.json`
   - `VERCEL_PROJECT_ID`: the `projectId` value from `project.json`
3. Every PR then gets a preview URL as a comment, and every push to `main` deploys to production.

In the Vercel project settings, set the Git integration so it does not auto-deploy. Otherwise every change deploys twice, once from Vercel and once from Actions.

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
