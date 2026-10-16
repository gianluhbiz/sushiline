import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion"
import { useLayoutEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import type { Location } from "../data/locations"
import type { Dish } from "../lib/hooks"
import { euro } from "../lib/time"

const RINGS = ["#1e9ba0", "#ff7a4d", "#f3eee4", "#23302b"]
const outStrong = [0.23, 1, 0.32, 1] as const

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${
    x + w - r
  } ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`
}

export function ConveyorHero({ loc, dishes, fromPicker }: { loc: Location; dishes: Dish[]; fromPicker: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const mobile = box.w < 768
  const plate = mobile ? 50 : Math.round(Math.min(box.w < 1280 ? 96 : 116, box.h * 0.12))
  const top = (mobile ? 64 : 80) + 6
  const side = mobile ? 8 : 22
  const pad = 8
  const x = side + pad + plate / 2
  const y = top + pad + plate / 2
  const w = Math.max(0, box.w - 2 * x)
  const h = Math.max(0, box.h - y - (side + pad + plate / 2))
  const r = Math.min(plate / 2 + (mobile ? 14 : 30), w / 2, h / 2)
  const d = roundedRect(x, y, w, h, r)
  const P = w && h ? 2 * (w + h) - 8 * r + 2 * Math.PI * r : 0
  const count = P ? Math.max(6, Math.floor(P / (plate * (mobile ? 1.7 : 1.9)))) : 0
  const shown = dishes.length ? Array.from({ length: count }, (_, i) => dishes[i % dishes.length]) : []

  /* belt motion: a slow constant crawl, sped up by scroll velocity, slowed by hover */
  const reduce = useReducedMotion()
  const inView = useInView(ref)
  const dist = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { stiffness: 260, damping: 40 })
  const factor = useSpring(1, { stiffness: 140, damping: 22 })
  useAnimationFrame((_, delta) => {
    if (reduce || !P || !inView) return
    const speed = ((mobile ? 26 : 40) + Math.min(Math.abs(vel.get()) * 0.6, 1100)) * factor.get()
    dist.set((dist.get() + (speed * Math.min(delta, 64)) / 1000) % P)
  })
  const slats = useTransform(dist, (v) => -v)

  const words = loc.name.toUpperCase().split("")
  const navigate = useNavigate()

  return (
    <section ref={ref} className="relative h-svh min-h-[600px] w-full overflow-hidden" aria-label={`Sushi Line ${loc.name}`}>
      {/* photo from the picker curtain, dimmed down */}
      <motion.img
        src={loc.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ filter: fromPicker ? "brightness(.45)" : "brightness(.2)", scale: fromPicker ? 1.02 : 1.08 }}
        animate={{ filter: "brightness(.24)", scale: 1.08 }}
        transition={{ duration: 1.6, ease: outStrong }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#0a0c0c_78%)]" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      {/* the belt */}
      {P > 0 && (
        <motion.svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          width={box.w}
          height={box.h}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <path d={d} fill="none" stroke="rgba(243,238,228,.14)" strokeWidth={plate + pad * 2 + 2} />
          <path d={d} fill="none" stroke="#0e1212" strokeWidth={plate + pad * 2} />
          <motion.path
            d={d}
            fill="none"
            stroke="rgba(243,238,228,.07)"
            strokeWidth={plate + pad * 2}
            strokeDasharray="1.5 22"
            style={{ strokeDashoffset: slats }}
          />
        </motion.svg>
      )}

      {/* plates */}
      {shown.map((dish, i) => (
        <Plate
          key={`${dish.id}-${i}`}
          dish={dish}
          i={i}
          path={d}
          offset={(i * P) / count}
          P={P}
          dist={dist}
          size={plate}
          ring={RINGS[i % RINGS.length]}
          mobile={mobile}
          onHover={(on) => factor.set(on ? 0.08 : 1)}
          onPick={() => navigate(`/${loc.slug}/menu?piatto=${dish.id}`)}
        />
      ))}

      {/* centre */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center text-center"
        style={{ padding: `${top + plate + pad * 2 + 12}px ${side + plate + pad * 2 + 10}px ${side + plate + pad * 2 + 12}px` }}
      >
        <motion.p
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-teal-hi md:text-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: outStrong }}
        >
          <span className="h-px w-6 bg-teal-hi/60" />
          Sede {loc.index}<span className="hidden sm:inline"> · {loc.area}</span>
          <span className="h-px w-6 bg-teal-hi/60" />
        </motion.p>

        <h1 className="mt-3 md:mt-5">
          <motion.span
            className="block font-serif text-[clamp(26px,4.2vw,64px)] italic leading-none text-rice/85"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.6 }}
          >
            Sushi Line
          </motion.span>
          <span className="sr-only">{loc.name}</span>
          <span aria-hidden className="flex justify-center overflow-hidden pb-[0.04em] font-display text-[clamp(56px,min(15vw,22svh),250px)] font-black uppercase leading-[0.8] tracking-tight">
            {words.map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.65 + i * 0.045, ease: [0.77, 0, 0.175, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          className="mt-5 max-w-[46ch] text-pretty text-sm leading-relaxed text-rice/75 md:mt-7 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: outStrong }}
        >
          All you can eat di cucina cinese e giapponese. Pranzo da {euro(loc.prices.lunch[0])}{" "}€, cena da{" "}
          {euro(loc.prices.dinner[0])}{" "}€. Sotto il metro d'altezza i bambini non pagano.
        </motion.p>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-9 md:gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: outStrong }}
        >
          <Link
            to={`/${loc.slug}/menu`}
            className="group flex h-12 items-center gap-2 rounded-full bg-rice pl-6 pr-2 text-sm font-semibold text-ink transition-transform duration-200 active:scale-[0.97] md:h-14 md:text-base"
          >
            Sfoglia il menu
            <span className="grid size-8 place-items-center rounded-full bg-ink text-rice transition-transform duration-300 ease-out group-hover:rotate-45 md:size-10">
              <i className="ri-arrow-right-up-line" aria-hidden />
            </span>
          </Link>
          <a
            href={loc.phoneHref}
            className="flex h-12 items-center gap-2 whitespace-nowrap rounded-full border border-rice/25 px-5 text-sm text-rice backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-rice/10 active:scale-[0.97] md:h-14 md:px-6 md:text-base"
          >
            <i className="ri-phone-line" aria-hidden />
            Prenota<span className="hidden sm:inline"> al {loc.phone}</span>
          </a>
        </motion.div>

        <motion.div
          className="mt-6 hidden items-center gap-5 font-mono [@media(max-height:820px)]:!hidden text-[11px] uppercase tracking-wider text-rice/50 md:mt-10 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {loc.rating && (
            <span className="flex items-center gap-1.5">
              <i className="ri-star-fill text-salmon" aria-hidden />
              {loc.rating.score.toLocaleString("it-IT")} su Google · {loc.rating.count.toLocaleString("it-IT")} recensioni
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <i className="ri-mouse-line" aria-hidden />
            Scorri e il nastro accelera
          </span>
        </motion.div>
      </div>
    </section>
  )
}

function Plate({
  dish,
  i,
  path,
  offset,
  P,
  dist,
  size,
  ring,
  mobile,
  onHover,
  onPick,
}: {
  dish: Dish
  i: number
  path: string
  offset: number
  P: number
  dist: MotionValue<number>
  size: number
  ring: string
  mobile: boolean
  onHover: (on: boolean) => void
  onPick: () => void
}) {
  const offsetDistance = useTransform(dist, (v) => `${(v + offset) % P}px`)
  const [hover, setHover] = useState(false)
  const tilt = ((i * 47) % 30) - 15

  return (
    <motion.button
      type="button"
      onClick={onPick}
      onMouseEnter={() => {
        setHover(true)
        onHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
        onHover(false)
      }}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-label={`${dish.num}. ${dish.name}: apri nel menu`}
      tabIndex={mobile ? -1 : 0}
      className="absolute left-0 top-0 z-20 cursor-pointer rounded-full"
      style={{ offsetPath: `path("${path}")`, offsetRotate: "0deg", offsetDistance, width: size, height: size }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: hover ? 1.12 : 1 }}
      transition={{ opacity: { duration: 0.5, delay: 0.7 + i * 0.035 }, scale: { type: "spring", duration: 0.45, bounce: 0.25 } }}
    >
      <span
        className="block size-full rounded-full p-[7%] shadow-[0_10px_24px_-6px_rgba(0,0,0,.7)]"
        style={{ background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.35), transparent 55%), ${ring}` }}
      >
        <img
          src={dish.img!}
          alt=""
          decoding="async"
          draggable={false}
          className="size-full rounded-full object-cover ring-2 ring-black/25"
          style={{ transform: `rotate(${tilt}deg) scale(1.15)` }}
        />
      </span>
      {!mobile && (
        <span className="pointer-events-none absolute -bottom-1 -right-1 rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] text-rice/80 ring-1 ring-rice/15">
          {dish.num}
        </span>
      )}
      <motion.span
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-md bg-rice px-2.5 py-1.5 text-left text-xs font-medium text-ink shadow-xl"
        initial={false}
        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 6, scale: hover ? 1 : 0.96 }}
        transition={{ duration: 0.18, ease: outStrong }}
        style={{ transformOrigin: "50% 100%" }}
      >
        {dish.name}
        <span className="ml-1.5 font-mono text-[10px] text-ink/50">apri</span>
      </motion.span>
    </motion.button>
  )
}
