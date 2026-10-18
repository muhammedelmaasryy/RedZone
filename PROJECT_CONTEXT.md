# Red Zone Store: project context

This file is the single source of context for the project. It covers what the project is, the decisions made so far, how the code is organized, and what comes next.

Last updated: 2026-10-18

---

## 1. The client and the goal

- **Client:** Red Zone Store, a Facebook-based gaming store in Minya el-Qamh, Sharqia, Egypt.
  - Facebook page: https://www.facebook.com/red.zone141097/
  - Tagline: "The Kingdom of the Games" / "مملكة الألعاب"
- **Business:** sells digital PlayStation games as account slots (PS5/PS4, primary and secondary, or the full account). It also sells PS Plus subscriptions and PSN wallet cards.
- **Current goal:** an extraordinary, animated, interactive **mock website** to show the client. The aim is to get their approval and interest before building the real store.
- **Scope of the mock:** frontend only. There is no backend and no real payments, and all products, prices and reviews are placeholder data.

### Long-term product (the real build, later)

The planning document `PS account QR login automation.md` is kept local and is not in the repo. It describes how the real store should deliver an order:

1. The customer pays. Delivery starts only after a verified payment webhook (Paymob, Kashier or Fawry; Vodafone Cash and InstaPay are preferred).
2. The backend reserves an account slot.
3. The customer scans the console's sign-in QR code with a live in-browser scanner (`barcode-detector`, which wraps zxing-cpp).
4. The backend validates the QR and creates a login request with an expiry countdown.
5. An operator gets an alert (a Telegram bot is recommended).
6. **A human approves the sign-in in the official PlayStation App.** This step must stay manual. Automating it would break Sony's ToS (section 10.7 bans bots and scripts) and risks banning the whole account inventory.
7. The customer confirms "I'm signed in", which also records delivery evidence.

Risks noted in that document:
- Sony's terms forbid reselling accounts.
- Payment gateways may refuse the business or freeze its funds.
- Each account has only one primary console per console generation.
- "Deactivate all" can be used only once every 6 months.
- Revoking one customer's access means changing the password, which signs out everyone else on that account.

---

## 2. Decisions made by the user

| Topic | Decision |
|---|---|
| Hosting | Vercel, deployed through its GitHub (Git) integration |
| CI | GitHub Actions running lint, typecheck and build |
| Language | Arabic (RTL, the default) with an English toggle |
| Scope | Landing page plus a clickable flow (catalog, product, checkout, order tracking) |
| 3D | A 3D hero; the rest uses 2D motion |
| Competitors | **Never** shown on the website: no names, links, prices or comparisons |
| Emojis | **None** anywhere on the site; SVG icons are used instead |
| "AI footprints" | Removed: no fake "online now" pills, no fake "X just bought…" tickers, no pulsing status dots |
| Git workflow | The user commits and pushes to `main` themselves |

---

## 3. Market research (internal only)

The full notes are in `research_notes/Red Zone Store market research/`, which is gitignored. In summary:

- **The store's own page:** products, prices and reviews are not publicly visible without logging in. The real catalog has to come from the owner.
- **Typical slot vocabulary in Egypt:**
  - **Primary:** plays from any user on the console, including offline.
  - **Secondary:** the cheaper option; the buyer must stay online and signed in to the seller's account.
  - **Full account:** the buyer gets the email and password.
  - **Offline:** the cheapest option.
- **Placeholder price anchors (EGP, 2026):**
  - Games:
    - EA FC 27: 900–8,250
    - Spider-Man 2: 1,250–4,100
    - CoD BO7: 750–3,500
    - Ghost of Yōtei: 1,300–3,500
    - GTA VI: 2,000–5,750
  - PSN wallet cards: about 53–56 EGP per US dollar.
  - PS Plus Essential, 12 months: about 4,300–5,800.
- **Common payment methods:** Vodafone Cash, InstaPay, Fawry, Visa/Mastercard, Meeza, and instalment services.
- **Gaps in comparable stores, which Red Zone uses as selling points:**
  - QR login, so no password is ever shared (other stores send credentials over WhatsApp).
  - PS5/PS4 and primary/secondary filters on listing pages.
  - A visible "slots left" count.
  - A clear written warranty.
  - A live order tracker.

---

## 4. Brand system

Colours were extracted from the logo and the cover banner (a median-cut palette, see `site/src/index.css`):

| Token | Hex | Source |
|---|---|---|
| `void` | `#050001` | banner black |
| `night` | `#110101` | banner |
| `blood` | `#280000` | logo background maroon |
| `ember` | `#38090f` | banner |
| `red-500` | `#ff1a1a` | logo neon outline |
| `red-600` | `#e50000` | diagonal stripes |
| `red-700` | `#b20001` | logo band |
| `red-800` | `#8c0001` | "RED" lettering |
| `ice-200` | `#d6d4da` | banner light |
| `ice-300` | `#bdc9e7` | "ZONE" lettering and shield |
| `ice-400` | `#a9bcf0` | ice accent |
| `dusk-500` | `#706b88` | hood highlight |
| `dusk-700` | `#4c3855` | hood |

- **Fonts:**
  - English headings: Russo One (display) and Teko (condensed).
  - Arabic headings: Lalezar.
  - Body text: Cairo, for both Arabic and English.
- **Motifs from the banner:**
  - diagonal red stripe bands
  - chevrons `<<<<` and rows of `××××`
  - HUD connector lines
  - pill-shaped progress bars
  - PlayStation shapes (△ ○ ✕ □) drawn as outlines
  - a striped circle
  - angled "clip" corners
- **Ice usage:** the user asked for more of the logo's ice blue. It appears in:
  - section kickers, the nav underline, and the hero's outlined headline line
  - the shield border and glow, and about a third of the 3D shapes
  - the HUD lines and chevrons, footer headings, ghost buttons, and card hover borders
- **Brand assets:** `site/public/brand/`. They were generated from the two WhatsApp images in the project root.
  - `logo.webp`: the full logo, 900px.
  - `mascot.webp`: the mascot cropped without the wordmark, used in the hero shield.
  - `favicon.png`: the hooded face crop.
  - `banner.webp`: the cover banner.

---

## 5. Tech stack

- **Framework:** Vite 8, React 19 and TypeScript.
- **Styling:** Tailwind CSS v4, with the design tokens defined in `@theme` in `src/index.css`.
- **Motion:** the `motion` package (formerly Framer Motion) handles gestures, layout animations, AnimatePresence and scroll transforms.
- **3D:** `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing` (bloom and vignette).
- **Smooth scroll:** Lenis.
- **Routing:** react-router-dom v7.
- **State:** Zustand (cart, order, toasts).
- **Effects:** canvas-confetti.
- **Lint:** oxlint. The remaining warnings are harmless; there are no errors.

---

## 6. Repository layout

```
redzone/
├─ .github/workflows/ci.yml        # lint + typecheck + build on push/PR
├─ .gitignore                      # excludes research notes, raw images, QR planning doc
├─ README.md                       # dev + deploy quick guide
├─ PROJECT_CONTEXT.md              # this file
├─ research_notes/                 # (gitignored) market research notes
├─ PS account QR login automation.md   # (gitignored) real-build planning doc
├─ WhatsApp Image ….jpeg           # (gitignored) original logo + banner
└─ site/                           # the web app (Vercel Root Directory)
   ├─ index.html                   # fonts, meta, lang="ar" dir="rtl"
   ├─ vercel.json                  # SPA rewrite to index.html
   ├─ vite.config.ts               # Tailwind plugin, three.js chunk split
   ├─ public/brand/                # logo, mascot, favicon, banner
   └─ src/
      ├─ main.tsx, App.tsx         # providers, router, Lenis, page transitions
      ├─ index.css                 # tokens, motifs, glitch, marquee
      ├─ i18n.tsx                  # AR/EN dictionary + provider (dir switch, EGP formatting)
      ├─ store.ts                  # Zustand: cart, order, toasts
      ├─ data/games.ts             # PLACEHOLDER catalog (18 games, slot prices)
      ├─ data/content.ts           # PLACEHOLDER WhatsApp/wallet numbers, PS Plus, cards, reviews, FAQ
      ├─ lib/hooks.ts              # media query, countdown, debounce, WebGL check
      ├─ lib/sceneReady.ts         # preloader waits for 3D scene warm-up
      ├─ components/
      │  ├─ Icon.tsx               # SVG icon set (replaces all emojis)
      │  ├─ GameCard.tsx, GameCover.tsx (generated cover art), FakeQR.tsx, PaymentLogos.tsx
      │  ├─ fx/                    # GlitchText, ScrambleText, MagneticButton, TiltCard,
      │  │                         # CursorGlow, Marquee, CountUp/AnimatedPrice, Reveal, Shapes
      │  ├─ layout/                # Navbar, Footer, CartDrawer, Preloader, Toasts (+ WhatsApp FAB)
      │  └─ three/HeroScene.tsx    # R3F scene (lazy-loaded)
      ├─ sections/                 # Home sections (Hero, TrustStrip, Bestsellers, SlotExplainer,
      │                            # DeliveryFlow, DealOfDay, PlusCards, SocialProof)
      └─ pages/                    # Home, Catalog, Product, Checkout, Order
```

---

## 7. Pages and features

### Global
- **Preloader:** the logo's maroon background, with its red diagonal band, fills the whole screen behind the logo. PlayStation shapes sit at the top and an ice pill progress bar at the bottom. It waits for the mascot image, the fonts and the 3D scene's first frames (capped at 5 s), then exits with a stripe wipe.
- **Navbar:**
  - hides when you scroll down and comes back when you scroll up
  - an animated active underline
  - an EN/AR toggle that flips `dir` on `<html>`
  - a cart badge
  - a full-screen menu on mobile
- **Pointer and transitions:** a custom cursor and red glow (desktop only), and a red stripe wipe between routes.
- **Cart drawer:** slides in from the correct side for RTL or LTR. Add-to-cart shows a "trophy unlocked" toast with an SVG icon.
- **WhatsApp button:** floating, with no pulse.
- **Footer:**
  - links and contact details
  - a payment wordmark strip (text-styled, no third-party logo files)
  - a "not affiliated with Sony" disclaimer
  - a "demo build, illustrative prices" note

### Home (`/`)
1. **Hero:**
   - an R3F scene with floating glowing PlayStation shapes, a halo ring and sparkles; the camera follows the mouse and the scroll position
   - the mascot in a shield that tilts with the mouse
   - the headline lines slide up, and "Play" / "العب" plays one glitch burst (it glitches again on hover)
   - magnetic CTA buttons and a "No password shared" badge
   - on phones: a smaller hero, a larger mascot placed above the text, and the 3D at reduced opacity
2. **Trust strip:** two skewed marquees showing trust points with icons, and game names.
3. **Best sellers:** a native horizontal scroller with snap points. It works with touch, trackpad, Shift+wheel, mouse drag and arrow buttons, and has a progress bar. It is RTL-aware.
4. **Primary or Secondary? explainer:** a PS5/PS4 toggle and three account types, with animated feature checks, a price that animates to its new value, and a small console illustration.
5. **How delivery works:** a pinned scroll story in four steps (pay, scan the console QR, Red Zone approves, game unlocked). It uses phone and TV mock-ups, a scan line, an approval beam and an unlocked game library.
6. **Deal of the day:** a flip-digit countdown to midnight.
7. **Counters:** numbers that count up when they scroll into view.
8. **PS Plus tiers:** a 1/3/12-month toggle with tilt cards, plus PSN wallet cards.
9. **Reviews:** two marquees of WhatsApp-style chat bubbles.
10. **FAQ:** an accordion, followed by a CTA band.

### Catalog (`/games`)
- A **sticky search bar at the top**. Clicking it opens a **pop-up filter panel** with:
  - console, account type, genre and sort options
  - a "quick results" preview
  - Clear and Show-results buttons

  The panel closes on an outside click or Escape.
- Search is **debounced by 350 ms**, and `?q=` in the URL syncs to the debounced value. This keeps request traffic low once the catalog comes from an API.
- The grid animates its layout when filters change. Mobile shows smaller 2-column cards.

### Product (`/game/:id`)
- Cover parallax, a console toggle, and a slot picker with a shared-layout highlight.
- An "Important notice" for each slot type.
- A PS Plus add-on, warranty and delivery details, and the number of slots left.
- A pre-order countdown (GTA VI releases 2026-11-19).
- Add to cart flies the cover into the cart. Buy now goes straight to checkout.
- Related games.

### Checkout (`/checkout`)
- **Form:** name and Egyptian mobile number, validated with `01[0125]xxxxxxxx`. The form shakes on an error.
- **Payment methods:**
  - Vodafone Cash or InstaPay: a number to transfer to, plus a drag-and-drop receipt upload.
  - Fawry: a flipping reference number.
  - Card: a card preview.
- **Order summary:** sticky, with the payment strip. Paying triggers confetti and goes to the order page.

### Order tracking (`/order/:id`)
- Simulates the real delivery flow: Paid → Slot reserved → Waiting for QR → Approving → Delivered.
- The QR step shows a scanner frame with an expiry countdown ring. It can open the **real camera** (`getUserMedia`), and offers "Simulate scan" and manual code entry.
- The approval step shows a pulse and the name of the operator who approved it.
- The final step has confetti and an "I'm signed in" confirmation.

---

## 8. Placeholders to replace before the real launch

- `site/src/data/content.ts`:
  - `WHATSAPP` (currently `https://wa.me/201000000000`)
  - `WALLET_NUMBER`, and the InstaPay handle in Checkout
  - the reviews, PS Plus prices and wallet card prices
- `site/src/data/games.ts`: the real game list, prices for each slot, and slot counts.
- Game art: real cover and hero images for all 18 games are in `site/public/games/<id>/cover.webp` (600px wide, 2:3) and `hero.webp` (up to 1600px wide). They are official publisher art taken from Steam, the PlayStation Store and the Microsoft Store, and they have no reuse licence. Get written permission from the publishers or the local Sony distributor before the real launch. `GameCover.tsx` falls back to generated artwork if an image fails to load.
- Some catalog platform lists differ from reality: NBA 2K27 has no PS4 version, and Red Dead Redemption 2 is a PS4 game that runs on PS5 through backwards compatibility. Fix `platforms` in `games.ts` when the real catalog arrives.
- The counters in `SocialProof.tsx` (5,200+ customers and so on) are illustrative.
- The tax number and real legal pages (terms and warranty policy in Arabic) don't exist yet.

---

## 9. Performance notes

- The three.js scene is split into its own chunk and lazy-loaded. The preloader hides its compile time; see `lib/sceneReady.ts`.
- The bloom effect renders at half resolution, screen sharpness (DPR) is capped at 1.5 (1 on phones), and phones get fewer shapes and particles.
- The render loop pauses (`frameloop="never"`) while the hero is off screen.
- No animated `filter: blur` on scroll reveals; only transform and opacity are animated.
- ScrambleText updates at about 25 fps.
- `prefers-reduced-motion`: Lenis, the glitch effect and the WebGL scene are all turned off.
- Devices without WebGL get a static hero.

---

## 10. Deploy and workflow

### First-time Vercel setup (done once)
1. vercel.com → Add New → Project → import `muhammedelmaasryy/RedZone`.
2. Set **Root Directory** to `site`. The framework (Vite), build command (`npm run build`) and output folder (`dist`) are detected automatically.
3. Deploy. From then on, every push to `main` redeploys production, and other branches get preview URLs.

### Day-to-day (the user commits and pushes)
```bash
cd C:\CUFE\Personal\redzone
cd site && npm run build && cd ..   # optional local check
git add -A
git commit -m "type: message"
git push
```

### Local development
```bash
cd site
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # serve the build
```

---

## 11. Change log

1. **Research and plan:** researched the store's page, comparable Egyptian stores and UX patterns. Extracted the palette, then agreed the stack, language, scope and 3D level.
2. **v1 mock:** the full site described in section 7, plus GitHub Actions CI and a Vercel deploy workflow.
3. **Round 2 feedback:**
   - The catalog search became a top bar with a pop-up filter panel and a debounced search.
   - The best-sellers row became a native horizontal scroller with arrows and drag.
   - Phone sizing: smaller cards, a smaller hero, buttons and headings.
   - Deployment switched to the Vercel Git integration, and the Actions deploy workflow was removed.
4. **Round 3 feedback:**
   - Every emoji was replaced with SVG icons.
   - The "online now" pill, the fake purchase ticker and the pulsing dots were removed.
   - More ice blue across the UI.
   - Phone hero: shorter, with a bigger logo.
5. **Round 4 feedback:**
   - The preloader now fills the whole screen with the logo's background.
   - Fixed the hero lag and glitching on load: the 3D is warmed up behind the preloader, the post-processing is lighter, the glitch plays once instead of looping, blur animations were removed, and the scene pauses off screen.
   - The workflow switched to the user committing and pushing directly to `main`.
6. **Round 5 feedback:** added real cover art (portrait for cards, product page and cart; landscape for the product page backdrop) for every game. Sources were verified by research and the files are self-hosted. Black Ops 7 uses a clean 5:6 Steam capsule because the 2:3 PlayStation Store image prints "Cross-Gen Bundle". Platform chips on covers moved to the top-left so they no longer collide with discount badges. Research notes: `research_notes/Game cover image sources/`, report: `reports/Game cover image sources.md` (both gitignored).

---

## 12. Possible next steps

- Get the real catalog, prices, contact numbers and photos from the client.
- Real backend, following the QR login automation plan:
  - payments (Paymob or Kashier, Fawry, InstaPay)
  - an inventory and slot model
  - a login-request queue
  - a Telegram operator bot
  - a live status page
- An admin or operator dashboard: the approval queue, account and slot management, and an audit log.
- Arabic legal pages (terms, warranty, refunds), as Egyptian consumer law requires.
- Test on a real console: how long the QR lasts, what it contains, and how many secondary consoles can be signed in at once.
