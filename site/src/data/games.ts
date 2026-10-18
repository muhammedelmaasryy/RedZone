import type { L10n } from '../i18n'

// PLACEHOLDER CATALOG — illustrative EGP prices for the pitch demo.
// Replace with the client's real list before launch.

export type SlotType = 'ps5Primary' | 'ps5Secondary' | 'ps4Primary' | 'ps4Secondary' | 'full'
export type Platform = 'ps5' | 'ps4'
export type Genre = 'sports' | 'action' | 'shooter' | 'adventure' | 'racing' | 'fighting' | 'rpg' | 'horror'
export type Shape = 'triangle' | 'circle' | 'cross' | 'square'

export type Game = {
  id: string
  title: string
  short: string
  genre: Genre
  platforms: Platform[]
  prices: Partial<Record<SlotType, number>>
  discount?: number
  slotsLeft: number
  badge?: 'hot' | 'new' | 'preorder'
  releaseDate?: string
  rating: number
  popularity: number
  added: number
  cover: { from: string; to: string; accent: string; shape: Shape }
  blurb: L10n
}

export const SLOT_ORDER: SlotType[] = ['ps5Primary', 'ps5Secondary', 'ps4Primary', 'ps4Secondary', 'full']

export const slotLabel: Record<SlotType, L10n> = {
  ps5Primary: { ar: 'PS5 برايمري', en: 'PS5 Primary' },
  ps5Secondary: { ar: 'PS5 سكندري', en: 'PS5 Secondary' },
  ps4Primary: { ar: 'PS4 برايمري', en: 'PS4 Primary' },
  ps4Secondary: { ar: 'PS4 سكندري', en: 'PS4 Secondary' },
  full: { ar: 'حساب كامل', en: 'Full account' },
}

export const slotNotice: Record<SlotType, L10n> = {
  ps5Primary: { ar: 'بيتفعّل كجهاز أساسي. تلعب من حسابك الشخصي وأوفلاين.', en: 'Activates as the main console. Play from your own ID, offline too.' },
  ps5Secondary: { ar: 'لازم الجهاز يكون متصل بالنت وأنت على حساب ريد زون. الأونلاين محتاج بلس.', en: 'Console must stay online on the Red Zone account. Online multiplayer needs PS Plus.' },
  ps4Primary: { ar: 'جهاز PS4 أساسي. ألعاب PS4 بتشتغل كمان على PS5 بنفس الحساب.', en: 'Main PS4 console. PS4 games also run on PS5 with the same account.' },
  ps4Secondary: { ar: 'تلعب وأنت مسجّل على حساب ريد زون والنت شغال.', en: 'Play while signed in to the Red Zone account with internet on.' },
  full: { ar: 'الحساب بالكامل ليك: إيميل وباسورد وتغيير البيانات.', en: 'The whole account is yours: email, password and recovery.' },
}

export const genreLabel: Record<Genre, L10n> = {
  sports: { ar: 'رياضة', en: 'Sports' },
  action: { ar: 'أكشن', en: 'Action' },
  shooter: { ar: 'شوتر', en: 'Shooter' },
  adventure: { ar: 'مغامرة', en: 'Adventure' },
  racing: { ar: 'سباقات', en: 'Racing' },
  fighting: { ar: 'قتال', en: 'Fighting' },
  rpg: { ar: 'RPG', en: 'RPG' },
  horror: { ar: 'رعب', en: 'Horror' },
}

const g = (x: Game) => x

export const games: Game[] = [
  g({
    id: 'fc27', title: 'EA SPORTS FC 27', short: 'FC 27', genre: 'sports', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 2450, ps5Secondary: 1150, ps4Primary: 1600, ps4Secondary: 900, full: 8250 },
    discount: 15, slotsLeft: 3, badge: 'hot', rating: 4.9, popularity: 100, added: 20,
    cover: { from: '#0b3d2e', to: '#050001', accent: '#4dff9a', shape: 'circle' },
    blurb: { ar: 'أحدث إصدار من الكورة الأشهر. التيم، الكارير والـUltimate Team بالكامل.', en: 'The latest season of the biggest football game. Career, clubs and Ultimate Team.' },
  }),
  g({
    id: 'gta6', title: 'Grand Theft Auto VI', short: 'GTA VI', genre: 'action', platforms: ['ps5'],
    prices: { ps5Primary: 3900, ps5Secondary: 2000, full: 5750 },
    slotsLeft: 6, badge: 'preorder', releaseDate: '2026-11-19', rating: 5, popularity: 99, added: 21,
    cover: { from: '#ff2d95', to: '#2b0b3d', accent: '#ffb347', shape: 'square' },
    blurb: { ar: 'رجوع لـ Vice City. احجز مكانك قبل النزول واستلم أول يوم.', en: 'Back to Vice City. Reserve your slot now and play on day one.' },
  }),
  g({
    id: 'spiderman2', title: "Marvel's Spider-Man 2", short: 'Spider-Man 2', genre: 'action', platforms: ['ps5'],
    prices: { ps5Primary: 2300, ps5Secondary: 1250, full: 4100 },
    discount: 20, slotsLeft: 2, badge: 'hot', rating: 4.8, popularity: 92, added: 10,
    cover: { from: '#b20001', to: '#120018', accent: '#ff1a1a', shape: 'triangle' },
    blurb: { ar: 'بيتر وميلز في نيويورك أكبر. أكشن سينمائي ومعارك ضد فينوم.', en: 'Peter and Miles in a bigger New York. Cinematic action against Venom.' },
  }),
  g({
    id: 'bo7', title: 'Call of Duty: Black Ops 7', short: 'Black Ops 7', genre: 'shooter', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 2100, ps5Secondary: 950, ps4Primary: 1400, ps4Secondary: 750, full: 3500 },
    slotsLeft: 5, badge: 'new', rating: 4.6, popularity: 90, added: 19,
    cover: { from: '#ff7a00', to: '#0a0a0c', accent: '#ffd36b', shape: 'cross' },
    blurb: { ar: 'كامبين، ملتي بلاير وزومبي. اكتر لعبة شوتر طلبًا عندنا.', en: 'Campaign, multiplayer and Zombies. Our most requested shooter.' },
  }),
  g({
    id: 'yotei', title: 'Ghost of Yōtei', short: 'Ghost of Yōtei', genre: 'adventure', platforms: ['ps5'],
    prices: { ps5Primary: 2400, ps5Secondary: 1300, full: 3500 },
    slotsLeft: 4, badge: 'new', rating: 4.9, popularity: 88, added: 18,
    cover: { from: '#d6d4da', to: '#3a0a0a', accent: '#ff1a1a', shape: 'circle' },
    blurb: { ar: 'رحلة انتقام في شمال اليابان. عالم مفتوح وقتال بالسيف.', en: 'A revenge journey across northern Japan. Open world sword combat.' },
  }),
  g({
    id: 'gowr', title: 'God of War Ragnarök', short: 'GoW Ragnarök', genre: 'action', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 1500, ps5Secondary: 750, ps4Primary: 1100, ps4Secondary: 600, full: 2600 },
    discount: 30, slotsLeft: 7, rating: 4.9, popularity: 84, added: 6,
    cover: { from: '#2b4c8c', to: '#05050c', accent: '#a9bcf0', shape: 'triangle' },
    blurb: { ar: 'كريتوس وأتريوس في نهاية العالم الإسكندنافي.', en: 'Kratos and Atreus face the end of the Norse world.' },
  }),
  g({
    id: 'rdr2', title: 'Red Dead Redemption 2', short: 'RDR 2', genre: 'adventure', platforms: ['ps4', 'ps5'],
    prices: { ps5Primary: 900, ps5Secondary: 450, ps4Primary: 700, ps4Secondary: 350, full: 1500 },
    discount: 40, slotsLeft: 9, rating: 4.9, popularity: 80, added: 2,
    cover: { from: '#8c0001', to: '#1a0d05', accent: '#ffcf8a', shape: 'cross' },
    blurb: { ar: 'الغرب الأمريكي في أضخم عالم مفتوح. قصة آرثر مورجان.', en: "The wild west in a massive open world. Arthur Morgan's story." },
  }),
  g({
    id: 'gt7', title: 'Gran Turismo 7', short: 'GT7', genre: 'racing', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 1300, ps5Secondary: 650, ps4Primary: 950, ps4Secondary: 500, full: 2200 },
    slotsLeft: 6, rating: 4.7, popularity: 70, added: 7,
    cover: { from: '#00a3ff', to: '#05050c', accent: '#e6f4ff', shape: 'circle' },
    blurb: { ar: 'أكتر من ٤٠٠ عربية وتجربة سواقة حقيقية.', en: '400+ cars and a true driving simulator.' },
  }),
  g({
    id: 'mk1', title: 'Mortal Kombat 1', short: 'MK1', genre: 'fighting', platforms: ['ps5'],
    prices: { ps5Primary: 1200, ps5Secondary: 600, full: 2000 },
    discount: 25, slotsLeft: 5, rating: 4.5, popularity: 68, added: 9,
    cover: { from: '#ffb400', to: '#1a0000', accent: '#ff1a1a', shape: 'square' },
    blurb: { ar: 'عالم جديد لموتال كومبات. Fatalities أقوى من أي وقت.', en: 'A new era of Mortal Kombat. Brutal fatalities.' },
  }),
  g({
    id: 'tekken8', title: 'Tekken 8', short: 'Tekken 8', genre: 'fighting', platforms: ['ps5'],
    prices: { ps5Primary: 1400, ps5Secondary: 700, full: 2300 },
    slotsLeft: 4, rating: 4.6, popularity: 66, added: 11,
    cover: { from: '#7a00ff', to: '#0a0018', accent: '#ff4dff', shape: 'cross' },
    blurb: { ar: 'تحدّى صحابك في أقوى لعبة قتال تلات أبعاد.', en: 'Challenge friends in the best 3D fighter.' },
  }),
  g({
    id: 'eldenNR', title: 'Elden Ring Nightreign', short: 'Nightreign', genre: 'rpg', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 1350, ps5Secondary: 700, ps4Primary: 1000, ps4Secondary: 550, full: 2300 },
    slotsLeft: 5, rating: 4.4, popularity: 64, added: 15,
    cover: { from: '#c9a227', to: '#0d0a05', accent: '#fff1b8', shape: 'triangle' },
    blurb: { ar: 'كو-أوب لتلات لاعيبة في عالم إلدن رينج.', en: 'Three-player co-op in the Elden Ring world.' },
  }),
  g({
    id: 're9', title: 'Resident Evil Requiem', short: 'RE Requiem', genre: 'horror', platforms: ['ps5'],
    prices: { ps5Primary: 2350, ps5Secondary: 1200, full: 3600 },
    slotsLeft: 3, badge: 'new', rating: 4.7, popularity: 76, added: 17,
    cover: { from: '#3d0000', to: '#000000', accent: '#9cff8a', shape: 'circle' },
    blurb: { ar: 'رعب نفسي من الطراز الأول. العب بالليل لو تقدر.', en: 'Top-tier survival horror. Play at night if you dare.' },
  }),
  g({
    id: 'tlou2', title: 'The Last of Us Part II Remastered', short: 'TLOU II', genre: 'adventure', platforms: ['ps5'],
    prices: { ps5Primary: 1250, ps5Secondary: 600, full: 2100 },
    discount: 35, slotsLeft: 6, rating: 4.8, popularity: 74, added: 5,
    cover: { from: '#2f4f2f', to: '#050505', accent: '#e6d3a3', shape: 'square' },
    blurb: { ar: 'قصة إيلي بجودة PS5 ومود No Return.', en: "Ellie's story remastered with the No Return mode." },
  }),
  g({
    id: 'nba2k27', title: 'NBA 2K27', short: 'NBA 2K27', genre: 'sports', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 2000, ps5Secondary: 950, ps4Primary: 1300, ps4Secondary: 700, full: 3900 },
    slotsLeft: 4, badge: 'new', rating: 4.3, popularity: 60, added: 16,
    cover: { from: '#1d428a', to: '#0a0a0c', accent: '#ff1a1a', shape: 'circle' },
    blurb: { ar: 'سلة NBA بأحدث التيمات واللاعيبة.', en: 'NBA basketball with the latest rosters.' },
  }),
  g({
    id: 'acshadows', title: "Assassin's Creed Shadows", short: 'AC Shadows', genre: 'rpg', platforms: ['ps5'],
    prices: { ps5Primary: 1700, ps5Secondary: 850, full: 2800 },
    discount: 20, slotsLeft: 5, rating: 4.5, popularity: 62, added: 12,
    cover: { from: '#5a0a1e', to: '#0a0508', accent: '#ffd6e0', shape: 'triangle' },
    blurb: { ar: 'نينجا وساموراي في اليابان الإقطاعية.', en: 'A shinobi and a samurai in feudal Japan.' },
  }),
  g({
    id: 'ds2', title: 'Death Stranding 2', short: 'Death Stranding 2', genre: 'adventure', platforms: ['ps5'],
    prices: { ps5Primary: 2100, ps5Secondary: 1050, full: 3300 },
    slotsLeft: 3, rating: 4.6, popularity: 58, added: 14,
    cover: { from: '#a9bcf0', to: '#0a0c18', accent: '#ffffff', shape: 'cross' },
    blurb: { ar: 'رحلة سام بريدجز الجديدة من كوجيما.', en: "Sam Bridges' new journey from Kojima Productions." },
  }),
  g({
    id: 'hogwarts', title: 'Hogwarts Legacy', short: 'Hogwarts Legacy', genre: 'rpg', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 950, ps5Secondary: 450, ps4Primary: 700, ps4Secondary: 350, full: 1600 },
    discount: 45, slotsLeft: 8, rating: 4.6, popularity: 72, added: 4,
    cover: { from: '#6b4ea0', to: '#0a0614', accent: '#ffd36b', shape: 'circle' },
    blurb: { ar: 'عيش سنة كاملة في مدرسة السحر.', en: 'Live your own year at the school of magic.' },
  }),
  g({
    id: 'minecraft', title: 'Minecraft', short: 'Minecraft', genre: 'adventure', platforms: ['ps5', 'ps4'],
    prices: { ps5Primary: 600, ps5Secondary: 300, ps4Primary: 500, ps4Secondary: 250, full: 1000 },
    slotsLeft: 10, rating: 4.7, popularity: 56, added: 1,
    cover: { from: '#3c8c2c', to: '#0a1a05', accent: '#c7ff9a', shape: 'square' },
    blurb: { ar: 'ابني عالمك مع صحابك. مناسبة لكل الأعمار.', en: 'Build your world with friends. Fun for all ages.' },
  }),
]

export const gameById = (id: string) => games.find((x) => x.id === id)

export function finalPrice(game: Game, slot: SlotType) {
  const base = game.prices[slot]
  if (base == null) return null
  return game.discount ? Math.round((base * (100 - game.discount)) / 100 / 10) * 10 : base
}

export function minPrice(game: Game) {
  const vals = SLOT_ORDER.map((s) => finalPrice(game, s)).filter((v): v is number => v != null)
  return Math.min(...vals)
}

export function slotsForPlatform(game: Game, p: Platform | 'all'): SlotType[] {
  return SLOT_ORDER.filter((s) => game.prices[s] != null && (p === 'all' || s.startsWith(p) || s === 'full'))
}
