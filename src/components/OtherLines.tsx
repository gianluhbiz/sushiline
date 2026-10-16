import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router"
import { CONTACTS, LOCATIONS, type Location } from "../data/locations"
import { useStatus } from "../lib/hooks"
import { SectionLabel } from "./SectionLabel"
import { StatusDot } from "./StatusDot"

export function OtherLines({ loc }: { loc: Location }) {
  const others = LOCATIONS.filter((l) => l.slug !== loc.slug)
  const [hover, setHover] = useState<Location | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 220, damping: 26 })
  const sy = useSpring(my, { stiffness: 220, damping: 26 })

  return (
    <section
      className="relative px-5 pt-28 md:px-10 md:pt-40"
      aria-labelledby="altre-title"
      onPointerMove={(e) => {
        mx.set(e.clientX)
        my.set(e.clientY)
      }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionLabel kanji="線">Le altre sedi</SectionLabel>
        <h2 id="altre-title" className="sr-only">
          Le altre sedi Sushi Line
        </h2>
        <ul className="mt-8 border-t border-rice/15" onMouseLeave={() => setHover(null)}>
          {others.map((o) => (
            <Row key={o.slug} loc={o} onHover={() => setHover(o)} />
          ))}
        </ul>
      </div>

      {/* image that trails the pointer, desktop only */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block" style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {hover && (
            <motion.img
              key={hover.slug}
              src={hover.gallery[0]}
              alt=""
              className="absolute -left-36 -top-48 h-96 w-72 rounded-xl object-cover shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mx-auto mt-32 max-w-6xl pb-10">
        <div className="grid gap-8 border-t border-rice/15 pt-10 text-sm text-rice/60 md:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-rice/40">Scrivici</p>
            <a href={CONTACTS.whatsapp} className="mt-2 block text-rice transition-colors hover:text-teal-hi">
              WhatsApp {CONTACTS.whatsappLabel}
            </a>
            <a href={`mailto:${CONTACTS.email}`} className="block text-rice transition-colors hover:text-teal-hi">
              {CONTACTS.email}
            </a>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-rice/40">Allergie</p>
            <p className="mt-2 max-w-[36ch]">Ogni piatto del menu riporta gli allergeni. Per dubbi chiedi al personale prima di ordinare.</p>
          </div>
          <div className="md:text-right">
            <p className="font-mono text-[11px] uppercase tracking-wider text-rice/40">Sushi Line</p>
            <p className="mt-2">Olbia · Nuoro · Sassari</p>
            <p>© {new Date().getFullYear()} Sushi Line S.r.l.</p>
          </div>
        </div>
        <p
          aria-hidden
          className="mt-12 select-none whitespace-nowrap text-center font-display text-[21vw] font-black uppercase leading-[0.75] tracking-tighter text-rice/[0.06] lg:text-[15.5rem]"
        >
          Sushi Line
        </p>
      </footer>
    </section>
  )
}

function Row({ loc, onHover }: { loc: Location; onHover: () => void }) {
  const st = useStatus(loc)
  return (
    <li className="border-b border-rice/15">
      <Link
        to={`/${loc.slug}`}
        onMouseEnter={onHover}
        onFocus={onHover}
        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:gap-10 md:py-10"
      >
        <span className="font-mono text-xs text-teal-hi">{loc.index}</span>
        <span className="min-w-0">
          <span className="block font-display text-[clamp(52px,10vw,150px)] font-black uppercase leading-[0.82] tracking-tight transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-3">
            {loc.name}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-rice/55">
            <span>{loc.street}</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <StatusDot open={st.open} />
              {st.label}
            </span>
          </span>
        </span>
        <span className="grid size-14 place-items-center rounded-full text-2xl ring-1 ring-rice/20 transition-[background-color,color,transform] duration-300 group-hover:-rotate-45 group-hover:bg-teal group-hover:text-ink md:size-20 md:text-3xl">
          <i className="ri-arrow-right-line" aria-hidden />
        </span>
      </Link>
    </li>
  )
}
