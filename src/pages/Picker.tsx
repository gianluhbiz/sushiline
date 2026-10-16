import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Page } from "../components/Page"
import { StatusDot } from "../components/StatusDot"
import { LOCATIONS, type Location, type Slug } from "../data/locations"
import { useMediaQuery, useNow, useStatus } from "../lib/hooks"
import { currentService } from "../lib/time"

const ease = [0.77, 0, 0.175, 1] as const

export default function Picker() {
  const [hover, setHover] = useState<Slug | null>(null)
  const [chosen, setChosen] = useState<Slug | null>(null)
  const navigate = useNavigate()
  const now = useNow()
  const { meal } = currentService(now)
  const reduce = useReducedMotion()

  // Navigate on a timer, not on onAnimationComplete: on touch screens the tap
  // fires hover and click together, the chosen curtain is already at flexGrow 1,
  // nothing animates and the completion callback never runs.
  useEffect(() => {
    if (!chosen) return
    const id = setTimeout(() => navigate(`/${chosen}`, { state: { from: "picker" } }), reduce ? 0 : 950)
    return () => clearTimeout(id)
  }, [chosen, navigate, reduce])

  return (
    <Page>
      <main className="relative h-svh w-full overflow-hidden bg-ink">
        <motion.header
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between bg-gradient-to-b from-ink/90 via-ink/40 to-transparent px-5 pb-16 pt-5 md:px-10 md:pt-8"
          animate={{ opacity: chosen ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <img src="/img/logo.png" alt="Sushi Line" className="h-10 w-auto md:h-14" />
            <p className="mt-3 hidden max-w-[22ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.25em] text-rice/55 md:block">
              Cucina cinese e giapponese. All you can eat in tre sedi sarde.
            </p>
          </div>
          <motion.h1
            className="max-w-[16ch] text-right font-serif text-3xl italic leading-[0.95] text-rice md:text-6xl"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
          >
            Dove mangi {meal === "lunch" ? "oggi a pranzo" : "stasera"}?
          </motion.h1>
        </motion.header>

        <div className="flex h-full flex-col md:flex-row" onMouseLeave={() => setHover(null)}>
          {LOCATIONS.map((loc, i) => (
            <Curtain
              key={loc.slug}
              loc={loc}
              i={i}
              hover={hover}
              chosen={chosen}
              onHover={setHover}
              onChoose={() => setChosen(loc.slug)}
            />
          ))}
        </div>

      </main>
    </Page>
  )
}

function Curtain({
  loc,
  i,
  hover,
  chosen,
  onHover,
  onChoose,
}: {
  loc: Location
  i: number
  hover: Slug | null
  chosen: Slug | null
  onHover: (s: Slug | null) => void
  onChoose: () => void
}) {
  const st = useStatus(loc)
  const desktop = useMediaQuery("(min-width: 768px)")
  const isHover = hover === loc.slug
  const isChosen = chosen === loc.slug
  const dimmed = (hover && !isHover) || (chosen && !isChosen)
  const grow = chosen ? (isChosen ? 1 : 0) : isHover ? (desktop ? 2.1 : 1.6) : 1

  return (
    <motion.button
      type="button"
      onMouseEnter={() => !chosen && onHover(loc.slug)}
      onFocus={() => !chosen && onHover(loc.slug)}
      onClick={() => !chosen && onChoose()}
      disabled={!!chosen && !isChosen}
      aria-label={`Entra in Sushi Line ${loc.name}, ${loc.street}`}
      className="group relative min-h-0 min-w-0 basis-0 cursor-pointer overflow-hidden text-left outline-offset-[-6px]"
      animate={{ flexGrow: grow }}
      initial={false}
      transition={{ duration: chosen ? 0.95 : 0.75, ease }}
    >
      {/* the curtain drops in from the rod */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease }}
      >
        <motion.img
          src={loc.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-700"
          style={{
            filter: isChosen
              ? "brightness(.45) saturate(1)"
              : isHover
                ? "brightness(.62) saturate(1.05)"
                : dimmed
                  ? "brightness(.22) saturate(.3)"
                  : "brightness(.38) saturate(.55)",
          }}
          initial={{ scale: 1.25 }}
          animate={{ scale: isHover || isChosen ? 1.02 : 1.12 }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

        {/* seam between curtains */}
        <div className="absolute inset-y-0 right-0 hidden w-px bg-rice/10 md:block" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-rice/10 md:hidden" />

        <motion.div className="absolute inset-0" animate={{ opacity: chosen ? 0 : 1 }} transition={{ duration: 0.35 }}>
          {/* index + kanji */}
          <div className="absolute left-8 top-52 hidden items-baseline gap-3 md:flex">
            <span className="font-mono text-xs tracking-[0.2em] text-teal-hi">{loc.index}</span>
            <span className="font-jp text-2xl text-rice/30 md:text-4xl">{loc.kanji}</span>
          </div>

          {/* name */}
          <h2
            className="absolute bottom-24 left-4 font-display text-[22vw] font-black uppercase leading-[0.8] tracking-tight text-rice md:bottom-28 md:left-8 md:text-[clamp(56px,6vw,120px)]"
          >
            {loc.name}
          </h2>

          {/* photo fan on hover */}
          {desktop && (
            <div className="pointer-events-none absolute right-8 top-1/2 h-64 w-48 -translate-y-1/2 lg:right-14 lg:h-80 lg:w-60">
              {[0, 1, 2].map((k) => (
                <motion.img
                  key={k}
                  src={loc.gallery.filter((g) => g !== loc.hero)[k]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full rounded-sm object-cover shadow-2xl shadow-black/60 ring-1 ring-rice/10"
                  initial={false}
                  animate={
                    isHover
                      ? { opacity: 1, y: 0, rotate: (k - 1) * 9, x: (k - 1) * 46, scale: 1 }
                      : { opacity: 0, y: 60, rotate: 0, x: 0, scale: 0.9 }
                  }
                  transition={{ duration: 0.6, delay: isHover ? 0.08 + k * 0.06 : 0, ease: [0.23, 1, 0.32, 1] }}
                />
              ))}
            </div>
          )}

          {/* footer of the curtain */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
            <div className="min-w-0">
              <p className="truncate text-sm text-rice/80">{loc.street}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-rice/60">
                <StatusDot open={st.open} />
                {st.label}
              </p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-rice/25 text-xl text-rice transition-[background-color,border-color,color,transform] duration-300 group-hover:border-teal group-hover:bg-teal group-hover:text-ink group-active:scale-95">
              <i className="ri-arrow-right-up-line" aria-hidden />
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
