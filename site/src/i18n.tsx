import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'ar' | 'en'
export type L10n = { ar: string; en: string }

const dict = {
  ar: {
    nav: { home: 'الرئيسية', games: 'الألعاب', plus: 'بلس وكروت', how: 'إزاي بنسلّم', faq: 'أسئلة', cart: 'السلة' },
    brand: { tagline: 'مملكة الألعاب', store: 'جيمنج ستور' },
    hero: {
      kicker: 'PS5 · PS4 · تسليم فوري',
      title1: 'العب',
      title2: 'قبل ما',
      title3: 'تقوم من مكانك',
      cta: 'تصفّح الألعاب',
      cta2: 'كلّمنا واتساب',
    },
    slots: {
      kicker: 'افهم قبل ما تشتري',
      title: 'برايمري ولا سكندري؟',
      sub: 'اختار نوع الحساب اللي يناسب طريقة لعبك. الفرق في السعر وفي اللعب أوفلاين.',
      primary: 'برايمري',
      secondary: 'سكندري',
      full: 'حساب كامل',
      fromPrice: 'يبدأ من',
      rows: {
        anyUser: 'تلعب من أي يوزر على الجهاز',
        offline: 'تلعب أوفلاين من غير نت',
        ownId: 'تلعب من حسابك الشخصي',
        plusNeeded: 'محتاج بلس عشان الأونلاين',
        price: 'السعر',
      },
      noteSecondary: 'السكندري لازم يكون الجهاز متصل بالنت وأنت مسجّل على حساب ريد زون.',
      notePrimary: 'البرايمري بيتفعّل كجهاز أساسي، فتقدر تلعب من حسابك وأي حد في البيت.',
    },
    how: {
      kicker: 'التسليم بالـ QR',
      title: '٤ خطوات وتبدأ تلعب',
      steps: [
        { t: 'ادفع بالطريقة اللي تريحك', d: 'فودافون كاش، إنستاباي، فوري أو فيزا. بنأكد الدفع أوتوماتيك.' },
        { t: 'افتح شاشة تسجيل الدخول', d: 'على الـPS5 أو PS4 هيظهرلك كود QR. صوّره من صفحة الطلب على موبايلك.' },
        { t: 'ريد زون بتوافق', d: 'واحد من فريقنا بيوافق على الدخول من تطبيق بلايستيشن الرسمي في ثواني.' },
        { t: 'اللعبة عندك', d: 'الجهاز بيسجّل دخول لوحده. تأكد من صفحة الطلب وابدأ العب.' },
      ],
      time: ['ثواني', 'دقيقة', '~٢ دقيقة', 'فورًا'],
      why: 'ليه QR؟ عشان الباسورد مايتبعتش لحد، والحساب يفضل آمن ليك ولغيرك.',
    },
    best: { kicker: 'مختارات', title: 'الأكثر مبيعًا', all: 'كل الألعاب', drag: 'اسحب' },
    deal: { kicker: 'عرض اليوم', title: 'خصم لفترة محدودة', ends: 'العرض بينتهي خلال', grab: 'احجز مكانك', h: 'ساعة', m: 'دقيقة', s: 'ثانية' },
    plus: {
      kicker: 'اشتراكات وكروت',
      title: 'بلس وكروت المحفظة',
      sub: 'اشتراكات PS Plus وكروت شحن لكل الريجونات.',
      months: 'شهور',
      month: 'شهر',
      cards: 'كروت شحن PSN',
      regions: 'أمريكي · إنجليزي · سعودي · إماراتي · تركي',
      popular: 'الأكثر طلبًا',
    },
    counters: { customers: 'جيمر وثقوا فينا', games: 'لعبة متاحة', minutes: 'دقيقة متوسط التسليم', rating: 'تقييم العملاء' },
    reviews: { kicker: 'من الواتساب', title: 'العملاء بيقولوا إيه', },
    faq: { kicker: 'أسئلة', title: 'أسئلة بتتكرر' },
    cta: { title: 'جاهز تدخل المملكة؟', sub: 'أكتر من ٥٠ لعبة متاحة دلوقتي بتسليم فوري.', btn: 'ابدأ التسوق' },
    footer: {
      about: 'ريد زون ستور — متجر ألعاب بلايستيشن ديجيتال في منيا القمح، الشرقية. تسليم بالـQR ودعم حقيقي.',
      links: 'روابط',
      contact: 'تواصل',
      hours: 'كل يوم من ١١ ص لـ ١١ م',
      location: 'منيا القمح، الشرقية، مصر',
      disclaimer: 'ريد زون ستور متجر مستقل وغير تابع لشركة Sony Interactive Entertainment. كل الأسماء والعلامات التجارية ملك أصحابها.',
      mock: 'نسخة تجريبية للعرض — الأسعار والمنتجات للتوضيح فقط.',
      rights: 'كل الحقوق محفوظة',
    },
    catalog: {
      title: 'كل الألعاب',
      sub: 'فلتر حسب الجهاز ونوع الحساب. الأسعار بتتغير حسب الـslot.',
      search: 'دوّر على لعبة...',
      filters: 'الفلاتر',
      done: 'عرض النتائج',
      quick: 'نتائج سريعة',
      searching: 'بندوّر...',
      platform: 'الجهاز',
      slot: 'نوع الحساب',
      genre: 'النوع',
      sort: 'ترتيب',
      all: 'الكل',
      sorts: { popular: 'الأكثر طلبًا', low: 'السعر: من الأقل', high: 'السعر: من الأعلى', new: 'الأحدث' },
      results: 'لعبة',
      empty: 'مفيش ألعاب بالفلتر ده. جرّب تغيّر الاختيارات.',
      reset: 'مسح الفلاتر',
    },
    card: { from: 'من', slotsLeft: 'أماكن متبقية', preorder: 'حجز مسبق', soldOut: 'خلصت', hot: 'نار', new: 'جديد', add: 'أضف' },
    product: {
      back: 'رجوع للألعاب',
      choose: 'اختار نوع الحساب',
      console: 'الجهاز',
      addons: 'إضافات',
      addPlus: 'PS Plus Essential شهر (للأونلاين)',
      warranty: 'ضمان طول مدة الحساب + إعادة تسجيل دخول مجانية ٣ مرات',
      delivery: 'التسليم: QR خلال ٥ دقايق في مواعيد العمل',
      region: 'ريجون الحساب',
      add: 'أضف للسلة',
      buy: 'اشتري دلوقتي',
      notice: 'ملاحظة مهمة',
      about: 'عن اللعبة',
      left: 'متبقي',
      related: 'ممكن يعجبك كمان',
      preorderIn: 'متاحة للحجز — النزول خلال',
      days: 'يوم',
    },
    cart: {
      title: 'سلتك',
      empty: 'السلة فاضية. يلا اختار لعبة.',
      total: 'الإجمالي',
      checkout: 'كمّل الطلب',
      remove: 'شيل',
      added: 'اتضافت للسلة!',
      trophy: 'تروفي جديد اتفتح',
    },
    checkout: {
      title: 'إتمام الطلب',
      info: 'بياناتك',
      name: 'الاسم',
      phone: 'رقم الموبايل (واتساب)',
      method: 'طريقة الدفع',
      summary: 'ملخص الطلب',
      pay: 'ادفع',
      secure: 'الدفع مؤمّن — بنأكد التحويل أوتوماتيك',
      wallet: 'حوّل على الرقم ده وارفع صورة التحويل',
      upload: 'اسحب صورة التحويل هنا أو اضغط للرفع',
      uploaded: 'تم رفع الصورة',
      fawryRef: 'رقم مرجعي فوري',
      fawryHint: 'ادفع من أي منفذ فوري بالرقم ده خلال ٢٤ ساعة.',
      card: 'بيانات الكارت',
      processing: 'بنأكد الدفع...',
      terms: 'موافق على الشروط والأحكام وسياسة الضمان',
      methods: { vf: 'فودافون كاش', instapay: 'إنستاباي', fawry: 'فوري', card: 'فيزا / ماستركارد' },
      required: 'اكتب اسمك ورقم صحيح',
    },
    order: {
      title: 'تتبع الطلب',
      id: 'رقم الطلب',
      steps: ['تم الدفع', 'تم حجز الحساب', 'مستني الـQR', 'جاري الموافقة', 'تم التسليم'],
      scanTitle: 'امسح كود الـQR من على شاشة الجهاز',
      scanSub: 'على الـPS5: Settings ← Users and Accounts ← Sign In. هيظهر كود QR وكود قصير تحته.',
      openCam: 'افتح الكاميرا',
      simulate: 'محاكاة المسح (عرض تجريبي)',
      manual: 'أو اكتب الكود القصير',
      manualBtn: 'إرسال',
      expires: 'الكود بينتهي خلال',
      approving: 'فريق ريد زون بيوافق على الدخول دلوقتي...',
      operator: 'تمت الموافقة بواسطة',
      done: 'الجهاز اتسجّل! استمتع باللعب',
      confirm: 'أنا دخلت الحساب',
      confirmed: 'شكرًا! تم تأكيد التسليم وبدأ الضمان.',
      restart: 'جرّب العرض تاني',
      shop: 'كمّل تسوق',
      camDenied: 'مقدرناش نفتح الكاميرا — استخدم المحاكاة أو الكود.',
    },
    toast: { lang: 'English' },
    common: { egp: 'ج.م', ps5: 'PS5', ps4: 'PS4', close: 'إغلاق', back: 'رجوع' },
  },
  en: {
    nav: { home: 'Home', games: 'Games', plus: 'Plus & Cards', how: 'How it works', faq: 'FAQ', cart: 'Cart' },
    brand: { tagline: 'The Kingdom of the Games', store: 'Gaming Store' },
    hero: {
      kicker: 'PS5 · PS4 · Instant delivery',
      title1: 'Play',
      title2: 'before you',
      title3: 'leave the couch',
      cta: 'Browse games',
      cta2: 'Chat on WhatsApp',
    },
    slots: {
      kicker: 'Know before you buy',
      title: 'Primary or Secondary?',
      sub: 'Choose the account type that fits how you play. The difference is price and offline play.',
      primary: 'Primary',
      secondary: 'Secondary',
      full: 'Full account',
      fromPrice: 'From',
      rows: {
        anyUser: 'Play from any user on the console',
        offline: 'Play offline without internet',
        ownId: 'Play from your own PSN ID',
        plusNeeded: 'Needs PS Plus for online',
        price: 'Price',
      },
      noteSecondary: 'Secondary needs the console online and signed in to the Red Zone account.',
      notePrimary: 'Primary activates as the main console, so you and everyone at home can play from your own ID.',
    },
    how: {
      kicker: 'QR delivery',
      title: '4 steps to playing',
      steps: [
        { t: 'Pay your way', d: 'Vodafone Cash, InstaPay, Fawry or card. Payment confirms automatically.' },
        { t: 'Open the sign-in screen', d: 'Your PS5 or PS4 shows a QR code. Scan it from the order page on your phone.' },
        { t: 'Red Zone approves', d: 'A team member approves the sign-in from the official PlayStation App in seconds.' },
        { t: 'Game unlocked', d: 'Your console signs in on its own. Confirm on the order page and start playing.' },
      ],
      time: ['Seconds', '1 min', '~2 min', 'Instant'],
      why: 'Why QR? The password is never sent to anyone, so the account stays safe for you and everyone else.',
    },
    best: { kicker: 'Hand-picked', title: 'Best sellers', all: 'All games', drag: 'Drag' },
    deal: { kicker: 'Deal of the day', title: 'Limited-time drop', ends: 'Deal ends in', grab: 'Grab a slot', h: 'hrs', m: 'min', s: 'sec' },
    plus: {
      kicker: 'Subscriptions & cards',
      title: 'PS Plus & wallet cards',
      sub: 'PS Plus memberships and top-up cards for every region.',
      months: 'months',
      month: 'month',
      cards: 'PSN wallet cards',
      regions: 'US · UK · KSA · UAE · TR',
      popular: 'Most popular',
    },
    counters: { customers: 'gamers trust us', games: 'games available', minutes: 'min avg. delivery', rating: 'customer rating' },
    reviews: { kicker: 'From WhatsApp', title: 'What gamers say' },
    faq: { kicker: 'FAQ', title: 'Frequently asked' },
    cta: { title: 'Ready to enter the Kingdom?', sub: '50+ games available right now with instant delivery.', btn: 'Start shopping' },
    footer: {
      about: 'Red Zone Store — a digital PlayStation games store in Minya el-Qamh, Sharqia. QR delivery and real support.',
      links: 'Links',
      contact: 'Contact',
      hours: 'Daily 11 AM – 11 PM',
      location: 'Minya el-Qamh, Sharqia, Egypt',
      disclaimer: 'Red Zone Store is an independent store and is not affiliated with Sony Interactive Entertainment. All trademarks belong to their owners.',
      mock: 'Demo build for presentation — prices and products are illustrative.',
      rights: 'All rights reserved',
    },
    catalog: {
      title: 'All games',
      sub: 'Filter by console and account type. Prices change with the slot.',
      search: 'Search a game...',
      filters: 'Filters',
      done: 'Show results',
      quick: 'Quick results',
      searching: 'Searching...',
      platform: 'Console',
      slot: 'Account type',
      genre: 'Genre',
      sort: 'Sort',
      all: 'All',
      sorts: { popular: 'Most popular', low: 'Price: low to high', high: 'Price: high to low', new: 'Newest' },
      results: 'games',
      empty: 'No games match these filters. Try changing them.',
      reset: 'Clear filters',
    },
    card: { from: 'From', slotsLeft: 'slots left', preorder: 'Pre-order', soldOut: 'Sold out', hot: 'Hot', new: 'New', add: 'Add' },
    product: {
      back: 'Back to games',
      choose: 'Choose account type',
      console: 'Console',
      addons: 'Add-ons',
      addPlus: 'PS Plus Essential 1 month (for online)',
      warranty: 'Warranty for the account term + 3 free re-logins',
      delivery: 'Delivery: QR within 5 min during working hours',
      region: 'Account region',
      add: 'Add to cart',
      buy: 'Buy now',
      notice: 'Important notice',
      about: 'About the game',
      left: 'left',
      related: 'You may also like',
      preorderIn: 'Pre-order open — releases in',
      days: 'days',
    },
    cart: {
      title: 'Your cart',
      empty: 'Your cart is empty. Go pick a game.',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
      added: 'Added to cart!',
      trophy: 'Trophy unlocked',
    },
    checkout: {
      title: 'Checkout',
      info: 'Your details',
      name: 'Name',
      phone: 'Mobile number (WhatsApp)',
      method: 'Payment method',
      summary: 'Order summary',
      pay: 'Pay',
      secure: 'Secure payment — transfers confirm automatically',
      wallet: 'Transfer to this number and upload the receipt',
      upload: 'Drop the receipt screenshot here or tap to upload',
      uploaded: 'Receipt uploaded',
      fawryRef: 'Fawry reference',
      fawryHint: 'Pay at any Fawry outlet with this number within 24 hours.',
      card: 'Card details',
      processing: 'Confirming payment...',
      terms: 'I accept the terms and the warranty policy',
      methods: { vf: 'Vodafone Cash', instapay: 'InstaPay', fawry: 'Fawry', card: 'Visa / Mastercard' },
      required: 'Enter your name and a valid number',
    },
    order: {
      title: 'Order tracking',
      id: 'Order',
      steps: ['Paid', 'Slot reserved', 'Waiting for QR', 'Approving', 'Delivered'],
      scanTitle: 'Scan the QR code on your console screen',
      scanSub: 'On PS5: Settings → Users and Accounts → Sign In. A QR code shows with a short code under it.',
      openCam: 'Open camera',
      simulate: 'Simulate scan (demo)',
      manual: 'Or type the short code',
      manualBtn: 'Send',
      expires: 'Code expires in',
      approving: 'The Red Zone team is approving your sign-in...',
      operator: 'Approved by',
      done: 'Console signed in! Enjoy the game',
      confirm: "I'm signed in",
      confirmed: 'Thanks! Delivery confirmed and your warranty has started.',
      restart: 'Replay the demo',
      shop: 'Keep shopping',
      camDenied: "Couldn't open the camera — use the simulation or the code.",
    },
    toast: { lang: 'العربية' },
    common: { egp: 'EGP', ps5: 'PS5', ps4: 'PS4', close: 'Close', back: 'Back' },
  },
}

export type Dict = (typeof dict)['ar']

type Ctx = {
  lang: Lang
  t: Dict
  dir: 'rtl' | 'ltr'
  toggle: () => void
  l: (v: L10n) => string
  egp: (n: number) => string
  num: (n: number) => string
}

const I18nCtx = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('rz-lang')
      if (saved === 'ar' || saved === 'en') return saved
    } catch { /* storage unavailable */ }
    return 'ar'
  })

  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem('rz-lang', lang) } catch { /* ignore */ }
  }, [lang])

  const toggle = useCallback(() => setLang((v) => (v === 'ar' ? 'en' : 'ar')), [])

  const value = useMemo<Ctx>(() => {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US'
    const nf = new Intl.NumberFormat(locale)
    return {
      lang,
      t: dict[lang] as Dict,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      toggle,
      l: (v) => v[lang],
      num: (n) => nf.format(n),
      egp: (n) => `${nf.format(n)} ${dict[lang].common.egp}`,
    }
  }, [lang, toggle])

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
