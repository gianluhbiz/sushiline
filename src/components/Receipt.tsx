import { AnimatePresence, motion, useInView, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import type { Location } from "../data/locations"
import { useNow } from "../lib/hooks"
import { currentService, euro, fmt } from "../lib/time"
import { SectionLabel } from "./SectionLabel"

type Meal = "lunch" | "dinner"
const outStrong = [0.23, 1, 0.32, 1] as const

export function Receipt({ loc }: { loc: Location }) {
  const now = useNow()
  const initial = currentService(now)
  const [meal, setMeal] = useState<Meal>(initial.meal)
  const [weekend, setWeekend] = useState(initial.weekend)
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [tiny, setTiny] = useState(0)

  const w = weekend ? 1 : 0
  const adult = (meal === "lunch" ? loc.prices.lunch : loc.prices.dinner)[w]
  const kid = (meal === "lunch" ? loc.prices.kidsLunch : loc.prices.kidsDinner)[w]
  const paying = adults + kids
  const total = adults * adult + kids * kid + paying * loc.prices.cover
  const people = adults + kids + tiny

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })

  const lines = [
    { key: "a", show: adults > 0, qty: adults, label: "Adulto", unit: euro(adult), sum: euro(adults * adult) },
    { key: "k", show: kids > 0, qty: kids, label: "Bimbo 100–120cm", unit: euro(kid), sum: euro(kids * kid) },
    { key: "t", show: tiny > 0, qty: tiny, label: "Bimbo sotto 1m", unit: "", sum: "gratis" },
    { key: "c", show: paying > 0, qty: paying, label: "Coperto", unit: euro(loc.prices.cover), sum: euro(paying * loc.prices.cover) },
  ]

  const date = new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <section className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40" aria-labelledby="conto-title">
      <div className="mx-auto grid max-w-6xl items-start gap-16 lg:grid-cols-[1fr_380px] lg:gap-24">
        <div>
          <SectionLabel kanji="帳">Il conto</SectionLabel>
          <h2 id="conto-title" className="mt-5 font-display text-[clamp(52px,8vw,124px)] font-black uppercase leading-[0.85] tracking-tight">
            Fai i conti
            <br />
            <span className="font-serif text-[0.62em] font-normal normal-case italic tracking-normal text-teal-hi">prima di sederti.</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-rice/70 md:text-lg">
            Prezzo fisso a persona e piatti senza limite. Dicci quando venite e in quanti: lo scontrino lo stampiamo noi.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Segmented
              label="Turno"
              value={meal}
              onChange={setMeal}
              options={[
                { value: "lunch", label: "Pranzo" },
                { value: "dinner", label: "Cena" },
              ]}
              id="meal"
            />
            <Segmented
              label="Giorno"
              value={weekend ? "we" : "wd"}
              onChange={(v) => setWeekend(v === "we")}
              options={[
                { value: "wd", label: "Feriale" },
                { value: "we", label: "Weekend e festivi" },
              ]}
              id="day"
            />
          </div>

          <div className="mt-8 divide-y divide-rice/10 border-y border-rice/10">
            <Stepper label="Adulti" hint={`${euro(adult)} €`} value={adults} set={setAdults} />
            <Stepper label="Bambini 100–120 cm" hint={`${euro(kid)} €`} value={kids} set={setKids} />
            <Stepper label="Bambini sotto i 100 cm" hint="gratis" value={tiny} set={setTiny} />
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-rice/40">Stima indicativa · bevande e dessert esclusi</p>
        </div>

        {/* printer + paper */}
        <div ref={ref} className="relative mx-auto w-full max-w-[380px]">
          <div className="relative z-10 h-6 rounded-full bg-ink-3 shadow-[inset_0_-2px_0_rgba(255,255,255,.06)] ring-1 ring-rice/10">
            <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black" />
          </div>
          <div className="-mt-3 overflow-hidden px-4 pb-10">
            <motion.div
              className="receipt-edge bg-rice px-6 pb-10 pt-8 font-mono text-[12px] uppercase leading-relaxed text-ink shadow-2xl"
              initial={{ y: "-101%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{ duration: 1.8, ease: [0.32, 0.72, 0, 1] }}
              layout
            >
              <div className="text-center">
                <img src="/img/logo.png" alt="" className="mx-auto h-12 w-auto opacity-90 [filter:grayscale(1)_brightness(.2)]" />
                <p className="mt-3">{loc.name} · {loc.street}</p>
                <p>Tel {loc.phone}</p>
              </div>
              <Rule />
              <div className="flex justify-between">
                <span>{date}</span>
                <span>{fmt(now.minutes)}</span>
              </div>
              <p className="mt-1">All you can eat · {meal === "lunch" ? "Pranzo" : "Cena"}</p>
              <p className="text-ink/60">{weekend ? "Weekend / festivo" : "Feriale"}</p>
              <Rule />
              <div className="min-h-6">
                <AnimatePresence initial={false}>
                  {lines
                    .filter((l) => l.show)
                    .map((l) => (
                      <motion.div
                        key={l.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: outStrong }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[2.2ch_1fr_auto] gap-2 py-0.5">
                          <span>{l.qty}</span>
                          <span className="truncate">
                            x {l.label}
                            {l.unit && <span className="text-ink/50"> {l.unit}</span>}
                          </span>
                          <span className="tabular-nums">{l.sum}</span>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {people === 0 && <p className="text-ink/50">Nessun coperto</p>}
              </div>
              <Rule />
              <motion.div layout className="flex items-end justify-between">
                <span className="text-sm font-medium">Totale EUR</span>
                <Total value={total} />
              </motion.div>
              {paying > 0 && (
                <motion.p layout className="mt-1 flex justify-between text-ink/60">
                  <span>A persona ({people})</span>
                  <span className="tabular-nums">{euro(total / Math.max(people, 1))}</span>
                </motion.p>
              )}
              <Rule />
              <motion.p layout className="text-center">Arigatō · a presto</motion.p>
              <motion.div
                layout
                aria-hidden
                className="mx-auto mt-4 h-10 w-4/5"
                style={{
                  background:
                    "repeating-linear-gradient(90deg,#0a0c0c 0 2px,transparent 2px 4px,#0a0c0c 4px 5px,transparent 5px 8px,#0a0c0c 8px 11px,transparent 11px 12px)",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Total({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 })
  useEffect(() => spring.set(value), [spring, value])
  const text = useTransform(spring, (v) => euro(Math.max(0, Math.round(v * 100) / 100)).replace("gratis", "0,00"))
  return <motion.span className="font-display text-5xl font-black leading-none tabular-nums tracking-tight">{text}</motion.span>
}

const Rule = () => <div className="my-3 border-t border-dashed border-ink/40" />

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  id,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  id: string
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-rice/50">{label}</legend>
      <div className="flex rounded-full bg-ink-2 p-1 ring-1 ring-rice/10">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`relative h-11 flex-1 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
              value === o.value ? "text-ink" : "text-rice/70 hover:text-rice"
            }`}
          >
            {value === o.value && (
              <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-teal" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />
            )}
            <span className="relative">{o.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Stepper({ label, hint, value, set }: { label: string; hint: string; value: number; set: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-base text-rice">{label}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-rice/45">{hint}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => set(Math.max(0, value - 1))}
          disabled={value === 0}
          aria-label={`Togli: ${label}`}
          className="grid size-11 place-items-center rounded-full text-lg text-rice ring-1 ring-rice/15 transition-[background-color,transform,opacity] duration-150 hover:bg-rice/10 active:scale-[0.94] disabled:opacity-30"
        >
          <i className="ri-subtract-line" aria-hidden />
        </button>
        <span className="w-8 text-center font-display text-2xl font-extrabold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => set(Math.min(20, value + 1))}
          aria-label={`Aggiungi: ${label}`}
          className="grid size-11 place-items-center rounded-full bg-rice text-lg text-ink transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.94]"
        >
          <i className="ri-add-line" aria-hidden />
        </button>
      </div>
    </div>
  )
}
