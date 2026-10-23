import { create } from 'zustand'
import type { SlotType } from './data/games'

export type CartItem = {
  key: string
  gameId: string
  slot: SlotType
  price: number
  addPlus: boolean
  customTitle?: string
  customSubtitle?: string
  customAccent?: string
}
export type PayMethod = 'vf' | 'instapay' | 'fawry' | 'card'
export type UserProfile = { name: string; phone: string }
export type Order = { id: string; items: CartItem[]; total: number; method: PayMethod; name: string; phone?: string; createdAt: number }
export type Toast = { id: number; title: string; body: string }

function loadSavedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('rz-user')
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    if (typeof parsed.name === 'string' && parsed.name.trim().length > 1 && typeof parsed.phone === 'string' && /^01[0125]\d{8}$/.test(parsed.phone)) {
      return { name: parsed.name.trim(), phone: parsed.phone }
    }
  } catch {
    /* ignore storage errors */
  }
  return null
}

type State = {
  cart: CartItem[]
  cartOpen: boolean
  user: UserProfile | null
  authOpen: boolean
  authRedirect: string | null
  order: Order | null
  toasts: Toast[]
  addToCart: (item: Omit<CartItem, 'key'>) => void
  removeFromCart: (key: string) => void
  setCartOpen: (v: boolean) => void
  setAuthOpen: (v: boolean, redirect?: string | null) => void
  signIn: (u: UserProfile) => void
  signOut: () => void
  placeOrder: (o: Omit<Order, 'id' | 'createdAt' | 'items' | 'total'>) => Order
  pushToast: (t: Omit<Toast, 'id'>) => void
  dropToast: (id: number) => void
}

export const PLUS_ADDON_PRICE = 450

export const useStore = create<State>((set, get) => ({
  cart: [],
  cartOpen: false,
  user: loadSavedUser(),
  authOpen: false,
  authRedirect: null,
  order: null,
  toasts: [],
  addToCart: (item) =>
    set((s) => ({ cart: [...s.cart, { ...item, key: `${item.gameId}-${item.slot}-${Date.now()}` }] })),
  removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),
  setCartOpen: (v) => set({ cartOpen: v }),
  setAuthOpen: (v, redirect = null) => set({ authOpen: v, authRedirect: v ? redirect : null }),
  signIn: (u) => {
    const clean: UserProfile = { name: u.name.trim(), phone: u.phone.replace(/\s/g, '') }
    try {
      localStorage.setItem('rz-user', JSON.stringify(clean))
    } catch {
      /* ignore */
    }
    set({ user: clean, authOpen: false })
  },
  signOut: () => {
    try {
      localStorage.removeItem('rz-user')
    } catch {
      /* ignore */
    }
    set({ user: null })
  },
  placeOrder: (o) => {
    const items = get().cart
    const order: Order = {
      ...o,
      items,
      total: cartTotal(items),
      id: `RZ-${Math.floor(10000 + Math.random() * 89999)}`,
      createdAt: Date.now(),
    }
    set({ order, cart: [] })
    return order
  },
  pushToast: (t) => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().dropToast(id), 3600)
  },
  dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price + (i.addPlus ? PLUS_ADDON_PRICE : 0), 0)
