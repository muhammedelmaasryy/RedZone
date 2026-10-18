import { create } from 'zustand'
import type { SlotType } from './data/games'

export type CartItem = { key: string; gameId: string; slot: SlotType; price: number; addPlus: boolean }
export type PayMethod = 'vf' | 'instapay' | 'fawry' | 'card'
export type Order = { id: string; items: CartItem[]; total: number; method: PayMethod; name: string; createdAt: number }
export type Toast = { id: number; title: string; body: string }

type State = {
  cart: CartItem[]
  cartOpen: boolean
  order: Order | null
  toasts: Toast[]
  addToCart: (item: Omit<CartItem, 'key'>) => void
  removeFromCart: (key: string) => void
  setCartOpen: (v: boolean) => void
  placeOrder: (o: Omit<Order, 'id' | 'createdAt' | 'items' | 'total'>) => Order
  pushToast: (t: Omit<Toast, 'id'>) => void
  dropToast: (id: number) => void
}

export const PLUS_ADDON_PRICE = 450

export const useStore = create<State>((set, get) => ({
  cart: [],
  cartOpen: false,
  order: null,
  toasts: [],
  addToCart: (item) =>
    set((s) => ({ cart: [...s.cart, { ...item, key: `${item.gameId}-${item.slot}-${Date.now()}` }] })),
  removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),
  setCartOpen: (v) => set({ cartOpen: v }),
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
