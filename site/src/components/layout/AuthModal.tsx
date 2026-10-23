import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useStore } from '../../store'
import { Icon } from '../Icon'

function AuthForm() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { user, authRedirect, setAuthOpen, signIn, signOut, pushToast } = useStore()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [err, setErr] = useState(false)

  const cleanPhone = phone.replace(/\s/g, '')
  const valid = name.trim().length > 1 && /^01[0125]\d{8}$/.test(cleanPhone)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setErr(true)
      setTimeout(() => setErr(false), 600)
      return
    }
    const target = authRedirect
    signIn({ name: name.trim(), phone: cleanPhone })
    pushToast({ title: t.auth.welcome, body: `${name.trim()} · ${cleanPhone}` })
    if (target) nav(target)
  }

  return (
    <motion.form
      onSubmit={submit}
      animate={err ? { x: [0, -10, 10, -6, 6, 0] } : {}}
      className="relative mt-5 flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-white/80">{t.auth.name}</span>
        <div className="relative">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.auth.namePlaceholder}
            autoFocus
            className="w-full border border-white/15 bg-void px-4 py-3 text-white placeholder:text-white/25 focus:border-red-500 focus:outline-none"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-white/80">{t.auth.phone}</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          dir="ltr"
          placeholder={t.auth.phonePlaceholder}
          className="w-full border border-white/15 bg-void px-4 py-3 font-mono tracking-wider text-white text-start placeholder:text-white/25 focus:border-red-500 focus:outline-none"
        />
      </label>

      <AnimatePresence>
        {err && !valid && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-red-400"
          >
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            <span>{t.auth.error}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-1 flex items-center gap-2 border border-ice-300/20 bg-ice-300/5 px-3 py-2.5 text-xs text-ice-300">
        <Icon name="shield" className="h-4 w-4 shrink-0 text-red-500" />
        <span>{t.auth.securityNote}</span>
      </div>

      <button
        type="submit"
        className="clip-angle-sm mt-1 flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-3.5 font-display text-sm tracking-wide text-white shadow-[0_0_30px_rgba(229,0,0,0.4)] transition hover:bg-red-500"
      >
        <span>{t.auth.submit}</span>
        <span className="rtl:rotate-180">→</span>
      </button>

      {user && (
        <button
          type="button"
          onClick={() => {
            signOut()
            setAuthOpen(false)
          }}
          className="inline-flex items-center justify-center gap-1.5 pt-1 text-xs text-white/45 transition hover:text-red-400"
        >
          <Icon name="logout" className="h-3.5 w-3.5" />
          <span>{t.auth.signOut}</span>
        </button>
      )}
    </motion.form>
  )
}

export function AuthModal() {
  const { t } = useI18n()
  const { user, authOpen, setAuthOpen } = useStore()

  return (
    <AnimatePresence>
      {authOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            key="auth-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            key="auth-box"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="clip-angle relative z-10 w-full max-w-md border border-red-500/40 bg-night p-6 shadow-[0_30px_90px_rgba(229,0,0,0.28)] sm:p-8"
          >
            <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-20 opacity-25 [mask-image:linear-gradient(black,transparent)]" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/50 bg-red-600/20 text-red-500">
                  <Icon name="user" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-xl text-white sm:text-2xl">{t.auth.title}</h3>
                  <p className="mt-0.5 text-xs text-ice-300/80">{t.brand.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                aria-label={t.common.close}
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition hover:border-red-500 hover:text-white"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            <p className="relative mt-4 text-sm leading-relaxed text-white/70">{t.auth.sub}</p>

            <AuthForm key={`${user?.name ?? ''}-${user?.phone ?? ''}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
