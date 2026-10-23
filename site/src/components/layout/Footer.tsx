import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FACEBOOK, WHATSAPP } from '../../data/content'
import { useI18n } from '../../i18n'
import { PaymentStrip } from '../PaymentLogos'
import { Chevrons, Crosses } from '../fx/Shapes'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="relative overflow-hidden border-t border-red-900/50 bg-night">
      <div className="stripes-bg pointer-events-none absolute inset-0 opacity-30" />
      <div
        className="pointer-events-none absolute -bottom-10 start-0 w-full select-none text-center font-display text-[22vw] leading-none text-white/[0.03]"
        dir="ltr"
      >
        RED ZONE
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img src="/brand/favicon.png" alt="" className="h-14 w-14 rounded-full ring-2 ring-ice-300" />
            <div dir="ltr" className="leading-none">
              <div className="font-display text-2xl">
                <span className="text-red-600">RED</span> <span className="text-ice-300">ZONE</span>
              </div>
              <div className="font-condensed tracking-[0.35em] text-white/60">
                {t.brand.tagline.toUpperCase()}
              </div>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ice-200/60">{t.footer.about}</p>
          <PaymentStrip />
        </div>
        <div>
          <h4 className="mb-4 font-condensed text-xl tracking-widest text-ice-300 uppercase">
            {t.footer.links}
          </h4>
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            <li>
              <Link className="hover:text-red-400" to="/">
                {t.nav.home}
              </Link>
            </li>
            <li>
              <Link className="hover:text-red-400" to="/games">
                {t.nav.games}
              </Link>
            </li>
            <li>
              <Link className="hover:text-red-400" to="/plus">
                {t.nav.plus}
              </Link>
            </li>
            <li>
              <Link className="hover:text-red-400" to="/#how">
                {t.nav.how}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-condensed text-xl tracking-widest text-ice-300 uppercase">
            {t.footer.contact}
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li>
              <motion.a
                whileHover={{ x: 4 }}
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-ice-300" /> WhatsApp
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ x: 4 }}
                href={FACEBOOK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-ice-400" /> Facebook
              </motion.a>
            </li>
            <li className="text-white/50">{t.footer.hours}</li>
            <li className="text-white/50">{t.footer.location}</li>
          </ul>
          <Chevrons className="mt-6 text-red-600" />
        </div>
      </div>
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/40 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Red Zone Store — {t.footer.rights}</p>
          <p className="max-w-2xl">{t.footer.disclaimer}</p>
          <Crosses count={4} className="text-white/30" />
        </div>
        <p className="pb-6 text-center text-[11px] text-red-400/60">{t.footer.mock}</p>
      </div>
    </footer>
  )
}
