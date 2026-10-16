import { useEffect, useState, useSyncExternalStore } from "react"
import type { Location, Slug } from "../data/locations"
import { romeNow, status } from "./time"

export type Dish = {
  id: string
  num: string | null
  name: string
  desc: string
  al: number[]
  spicy: boolean
  pz: number | null
  img: string | null
  price: string | null
}

export type Category = { id: string; name: string; items: Dish[] }

const loaders: Record<Slug, () => Promise<{ default: Category[] }>> = {
  olbia: () => import("../data/menu/olbia.json") as Promise<{ default: Category[] }>,
  nuoro: () => import("../data/menu/nuoro.json") as Promise<{ default: Category[] }>,
  sassari: () => import("../data/menu/sassari.json") as Promise<{ default: Category[] }>,
}

const cache = new Map<Slug, Category[]>()

export function useMenu(slug: Slug) {
  const [menu, setMenu] = useState<Category[] | null>(() => cache.get(slug) ?? null)
  // callers are keyed by slug, so the initial state is always for this slug
  useEffect(() => {
    if (cache.has(slug)) return
    let alive = true
    loaders[slug]().then((m) => {
      cache.set(slug, m.default)
      if (alive) setMenu(m.default)
    })
    return () => {
      alive = false
    }
  }, [slug])
  return menu
}

/** Re-renders every 30s so open/closed labels stay true */
export function useNow() {
  const [now, setNow] = useState(romeNow)
  useEffect(() => {
    const id = setInterval(() => setNow(romeNow()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export const useStatus = (loc: Location) => status(loc, useNow())

/* ---------- personal order list, one per location ---------- */

type Order = Record<string, number>
const listeners = new Set<() => void>()
const memory = new Map<Slug, Order>()

function read(slug: Slug): Order {
  if (memory.has(slug)) return memory.get(slug)!
  let value: Order
  try {
    value = JSON.parse(localStorage.getItem(`sushiline:list:${slug}`) ?? "{}")
  } catch {
    value = {}
  }
  memory.set(slug, value)
  return value
}

function write(slug: Slug, next: Order) {
  memory.set(slug, next)
  try {
    localStorage.setItem(`sushiline:list:${slug}`, JSON.stringify(next))
  } catch {
    /* private mode: keep it in memory */
  }
  listeners.forEach((l) => l())
}

export function useOrder(slug: Slug) {
  const order = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => read(slug),
  )
  const set = (id: string, qty: number) => {
    const next = { ...read(slug) }
    if (qty <= 0) delete next[id]
    else next[id] = Math.min(qty, 99)
    write(slug, next)
  }
  return {
    order,
    count: Object.values(order).reduce((a, b) => a + b, 0),
    add: (id: string) => set(id, (read(slug)[id] ?? 0) + 1),
    remove: (id: string) => set(id, (read(slug)[id] ?? 0) - 1),
    clear: () => write(slug, {}),
  }
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
  )
}

export const ALLERGENS: Record<number, string> = {
  1: "Glutine",
  2: "Crostacei",
  3: "Uova",
  4: "Pesce",
  5: "Arachidi",
  6: "Soia",
  7: "Latte",
  8: "Frutta a guscio",
  9: "Sedano",
  10: "Senape",
  11: "Sesamo",
  12: "Solfiti",
  13: "Lupini",
  14: "Molluschi",
}
