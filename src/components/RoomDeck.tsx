import { AnimatePresence, motion, type PanInfo } from "framer-motion"
import { useState } from "react"
import type { Location } from "../data/locations"
import { SectionLabel } from "./SectionLabel"

export function RoomDeck({ loc }: { loc: Location }) {
  const [order, setOrder] = useState(() => loc.gallery.map((_, i) => i))
  const [dir, setDir] = useState(1)
  const top = order[0]

  const next = (d = 1) => {
    setDir(d)
    setOrder((o) => (d > 0 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]))
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // a quick flick is enough; distance alone also works
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 450) next(info.offset.x < 0 ? 1 : -1)
  }

  const landscape = loc.slug === "nuoro"

  return (
    <section className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40" aria-labelledby="sala-title">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div
          className={`relative mx-auto w-full ${landscape ? "aspect-[4/3] max-w-[560px]" : "aspect-[3/4] max-w-[420px]"}`}
          role="region"
          aria-roledescription="mazzo di foto"
          aria-label={`Foto ${top + 1} di ${loc.gallery.length}`}
        >
          {order
            .slice(0, 4)
            .reverse()
            .map((idx) => {
              const depth = order.indexOf(idx)
              const isTop = depth === 0
              return (
                <motion.div
                  key={idx}
                  className={`absolute inset-0 overflow-hidden rounded-2xl bg-ink-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] ring-1 ring-rice/10 ${
                    isTop ? "cursor-grab active:cursor-grabbing" : ""
                  }`}
                  style={{ zIndex: 10 - depth }}
                  initial={false}
                  animate={{
                    scale: 1 - depth * 0.05,
                    y: depth * 18,
                    rotate: depth === 0 ? 0 : (depth % 2 ? 1 : -1) * (depth * 2.5),
                    opacity: depth > 2 ? 0 : 1,
                  }}
                  transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
                  drag={isTop ? "x" : false}
                  dragSnapToOrigin
                  dragElastic={0.7}
                  onDragEnd={isTop ? onDragEnd : undefined}
                  whileDrag={{ rotate: dir * 3, scale: 1.02 }}
                >
                  <img src={loc.gallery[idx]} alt={`Sushi Line ${loc.name}, piatto ${idx + 1}`} draggable={false} className="h-full w-full object-cover" />
                </motion.div>
              )
            })}
        </div>

        <div>
          <SectionLabel kanji="席">La sala</SectionLabel>
          <h2 id="sala-title" className="mt-5 font-display text-[clamp(52px,8vw,124px)] font-black uppercase leading-[0.85] tracking-tight">
            Al tavolo
            <br />
            <span className="font-serif text-[0.62em] font-normal normal-case italic tracking-normal text-teal-hi">o sul divano.</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-rice/70 md:text-lg">
            {loc.blurb} La sala è grande: ti siedi e ordini dal menu all you can eat. Se preferisci casa tua, ordini online e passi a ritirare.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={loc.takeaway}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97]"
            >
              <i className="ri-shopping-bag-3-line" aria-hidden />
              Ordina da asporto
            </a>
            {loc.delivery && (
              <a
                href={loc.delivery}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-full border border-rice/25 px-5 text-sm text-rice transition-[background-color,transform] duration-200 hover:bg-rice/10 active:scale-[0.97]"
              >
                <i className="ri-e-bike-2-line" aria-hidden />
                Consegna a domicilio
              </a>
            )}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <button
              type="button"
              onClick={() => next(-1)}
              aria-label="Foto precedente"
              className="grid size-12 place-items-center rounded-full text-xl ring-1 ring-rice/20 transition-[background-color,transform] duration-150 hover:bg-rice/10 active:scale-[0.94]"
            >
              <i className="ri-arrow-left-line" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => next(1)}
              aria-label="Foto successiva"
              className="grid size-12 place-items-center rounded-full bg-rice text-xl text-ink transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.94]"
            >
              <i className="ri-arrow-right-line" aria-hidden />
            </button>
            <div className="flex items-baseline gap-1 font-mono text-sm text-rice/50">
              <span className="relative inline-block h-5 w-6 overflow-hidden text-rice">
                <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                  <motion.span
                    key={top}
                    className="absolute inset-0"
                    custom={dir}
                    initial={{ y: dir * 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: dir * -20, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {String(top + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              / {String(loc.gallery.length).padStart(2, "0")}
            </div>
            <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-wider text-rice/40 sm:block">
              <i className="ri-drag-move-line mr-1" aria-hidden />
              Lancia la foto di lato
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
