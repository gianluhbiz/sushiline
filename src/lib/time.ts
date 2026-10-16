import type { Location, Window } from "../data/locations"

export const DAYS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

/** Current day and minutes in Sardinia, whatever the visitor's timezone */
export function romeNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0"
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

export const windowsFor = (loc: Location, day: number): Window[] =>
  day === 0 ? loc.hours.sunday : loc.hours.weekday

export const fmt = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

export const fmtRange = ([a, b]: Window) => `${fmt(a)}–${fmt(b)}`

export type Status = { open: boolean; label: string }

export function status(loc: Location, now = romeNow()): Status {
  const today = windowsFor(loc, now.day)
  const current = today.find(([a, b]) => now.minutes >= a && now.minutes < b)
  if (current) return { open: true, label: `Aperto, chiude alle ${fmt(current[1])}` }
  const next = today.find(([a]) => a > now.minutes)
  if (next) return { open: false, label: `Chiuso, riapre alle ${fmt(next[0])}` }
  const tomorrow = windowsFor(loc, (now.day + 1) % 7)[0]
  return { open: false, label: `Chiuso, domani dalle ${fmt(tomorrow[0])}` }
}

/** Lunch until 17:00, weekend = Saturday and Sunday */
export const currentService = (now = romeNow()) => ({
  meal: now.minutes < 17 * 60 ? ("lunch" as const) : ("dinner" as const),
  weekend: now.day === 0 || now.day === 6,
})

export const euro = (n: number) =>
  n === 0 ? "gratis" : n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
