import type { L10n } from '../i18n'

// PLACEHOLDER CONTENT — demo copy for the pitch. Swap with real data from the client.

export const WHATSAPP = 'https://wa.me/201000000000'
export const FACEBOOK = 'https://www.facebook.com/red.zone141097/'
export const WALLET_NUMBER = '010 0000 0000'

export const plusTiers = [
  {
    id: 'essential', name: 'Essential', color: '#a9bcf0',
    perks: [{ ar: 'لعب أونلاين', en: 'Online multiplayer' }, { ar: 'ألعاب شهرية', en: 'Monthly games' }, { ar: 'تخزين سحابي', en: 'Cloud saves' }],
    prices: { 1: 450, 3: 1250, 12: 4300 },
  },
  {
    id: 'extra', name: 'Extra', color: '#ff1a1a', popular: true,
    perks: [{ ar: 'كل مميزات Essential', en: 'Everything in Essential' }, { ar: 'مكتبة +٤٠٠ لعبة', en: '400+ game catalog' }, { ar: 'ألعاب يوبيسوفت+', en: 'Ubisoft+ Classics' }],
    prices: { 1: 750, 3: 2100, 12: 6900 },
  },
  {
    id: 'premium', name: 'Premium', color: '#ffd36b',
    perks: [{ ar: 'كل مميزات Extra', en: 'Everything in Extra' }, { ar: 'ألعاب كلاسيك', en: 'Classics catalog' }, { ar: 'تجارب ألعاب جديدة', en: 'Game trials' }],
    prices: { 1: 900, 3: 2550, 12: 8200 },
  },
] satisfies { id: string; name: string; color: string; popular?: boolean; perks: L10n[]; prices: Record<1 | 3 | 12, number> }[]

export const walletCards = [
  { usd: 10, egp: 560 },
  { usd: 25, egp: 1380 },
  { usd: 50, egp: 2750 },
  { usd: 100, egp: 5450 },
]

export const reviews: { name: string; city: L10n; text: L10n; game: string; time: string }[] = [
  { name: 'Ahmed M.', city: { ar: 'الزقازيق', en: 'Zagazig' }, game: 'FC 27', time: '11:42 PM', text: { ar: 'والله ما خدت دقيقتين، صوّرت الكود والجهاز دخل علطول 🔥', en: 'Took under two minutes. Scanned the code and the console signed in right away 🔥' } },
  { name: 'Youssef K.', city: { ar: 'منيا القمح', en: 'Minya el-Qamh' }, game: 'Spider-Man 2', time: '8:15 PM', text: { ar: 'تالت مرة اشتري منكم، محترمين جدًا والضمان حقيقي', en: 'Third time buying from you. Very respectful and the warranty is real.' } },
  { name: 'Omar H.', city: { ar: 'بلبيس', en: 'Belbeis' }, game: 'Black Ops 7', time: '6:03 PM', text: { ar: 'السعر أحسن من أي حتة سألت فيها، والتسليم سريع', en: 'Fair price and super fast delivery.' } },
  { name: 'Mostafa A.', city: { ar: 'القاهرة', en: 'Cairo' }, game: 'GTA VI', time: '1:27 AM', text: { ar: 'حجزت GTA VI برايمري، مستني يوم النزول 😂❤️', en: 'Pre-ordered GTA VI primary, counting the days 😂❤️' } },
  { name: 'Karim S.', city: { ar: 'العاشر', en: '10th of Ramadan' }, game: 'Ghost of Yōtei', time: '9:50 PM', text: { ar: 'الجهاز فصل مني مرة وكلمتهم رجّعوه في خمس دقايق', en: 'My console signed out once, they fixed it in five minutes.' } },
  { name: 'Hassan E.', city: { ar: 'المنصورة', en: 'Mansoura' }, game: 'Gran Turismo 7', time: '4:31 PM', text: { ar: 'أول مرة أشتري ديجيتال وكنت قلقان، طلعت أسهل حاجة', en: 'First time buying digital and I was worried. Turned out to be the easiest thing.' } },
]

export const faqs: { q: L10n; a: L10n }[] = [
  {
    q: { ar: 'يعني إيه تسليم بالـQR؟', en: 'What is QR delivery?' },
    a: { ar: 'بدل ما نبعتلك إيميل وباسورد، بتفتح شاشة تسجيل الدخول على الجهاز وتمسح الكود من صفحة طلبك. فريقنا بيوافق من تطبيق بلايستيشن الرسمي والجهاز بيدخل لوحده.', en: 'Instead of sending you an email and password, you open the console sign-in screen and scan its code from your order page. Our team approves it from the official PlayStation App and the console signs in by itself.' },
  },
  {
    q: { ar: 'إيه الفرق بين برايمري وسكندري؟', en: "What's the difference between Primary and Secondary?" },
    a: { ar: 'البرايمري بيخلي جهازك هو الأساسي للحساب، فتلعب من حسابك وأوفلاين. السكندري أرخص، بس لازم تلعب وأنت على حسابنا والنت شغال.', en: 'Primary makes your console the main one for the account, so you play from your own ID and offline. Secondary is cheaper but you play signed in to our account with internet on.' },
  },
  {
    q: { ar: 'التسليم بياخد قد إيه؟', en: 'How long does delivery take?' },
    a: { ar: 'في مواعيد العمل (١١ ص - ١١ م) غالبًا أقل من ٥ دقايق من ساعة ما تمسح الكود.', en: 'During working hours (11 AM – 11 PM) usually under 5 minutes from the moment you scan.' },
  },
  {
    q: { ar: 'الضمان بيغطي إيه؟', en: 'What does the warranty cover?' },
    a: { ar: 'لو الجهاز خرج من الحساب لأي سبب مش منك، بنرجعك مجانًا. عندك ٣ مرات إعادة تسجيل دخول مجانية طول مدة الضمان.', en: 'If your console gets signed out for any reason that is not your fault, we sign you back in for free. You get 3 free re-logins during the warranty.' },
  },
  {
    q: { ar: 'إزاي أدفع؟', en: 'How can I pay?' },
    a: { ar: 'فودافون كاش، إنستاباي، فوري، أو فيزا وماستركارد. الدفع بيتأكد أوتوماتيك.', en: 'Vodafone Cash, InstaPay, Fawry, or Visa and Mastercard. Payment confirms automatically.' },
  },
]

export const operators = ['Mahmoud', 'Ziad', 'Mohamed']

export const recentOrders: { name: string; game: string; slot: L10n; mins: number }[] = [
  { name: 'Ahmed', game: 'FC 27', slot: { ar: 'PS5 برايمري', en: 'PS5 Primary' }, mins: 2 },
  { name: 'Mariam', game: 'Hogwarts Legacy', slot: { ar: 'PS4 سكندري', en: 'PS4 Secondary' }, mins: 4 },
  { name: 'Omar', game: 'Black Ops 7', slot: { ar: 'PS5 سكندري', en: 'PS5 Secondary' }, mins: 7 },
  { name: 'Youssef', game: 'GTA VI', slot: { ar: 'PS5 برايمري', en: 'PS5 Primary' }, mins: 9 },
  { name: 'Karim', game: 'Spider-Man 2', slot: { ar: 'PS5 برايمري', en: 'PS5 Primary' }, mins: 12 },
]
