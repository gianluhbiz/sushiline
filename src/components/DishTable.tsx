import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion"
import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Location } from "../data/locations"
import type { Dish } from "../lib/hooks"
import { SectionLabel } from "./SectionLabel"

/** deterministic 0..1 noise so the layout is stable between renders */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function DishTable({ loc, dishes, total }: { loc: Location; dishes: Dish[]; total: number }) {
  const frame = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const small = view.w < 768
  const cols = small ? Math.ceil(dishes.length / 3) : 9
  const cellW = small ? 200 : 320
  const cellH = small ? 190 : 330
  const rows = Math.ceil(dishes.length / cols)
  const W = cols * cellW + cellW / 2
  const H = rows * cellH
  const minX = Math.min(0, view.w - W)
  const minY = Math.min(0, view.h - H)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const centred = useRef(false)
  useLayoutEffect(() => {
    if (!view.w || centred.current) return
    x.set(minX / 2)
    y.set(minY / 2)
    centred.current = true
  }, [view.w, minX, minY, x, y])

  const dragging = useRef(false)
  const [touched, setTouched] = useState(false)
  const navigate = useNavigate()

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="tavolo-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <SectionLabel kanji="目">Il tavolo</SectionLabel>
          <h2 id="tavolo-title" className="mt-5 font-display text-[clamp(52px,8vw,124px)] font-black uppercase leading-[0.85] tracking-tight">
            {total} piatti,
            <br />
            <span className="font-serif text-[0.62em] font-normal normal-case italic tracking-normal text-salmon">un solo prezzo.</span>
          </h2>
        </div>
        <p className="max-w-[34ch] text-base leading-relaxed text-rice/65 md:text-right">
          Afferra il tavolo e spostalo. Tocca un piatto per leggere ingredienti e allergeni nel menu di {loc.name}.
        </p>
      </div>

      <div
        ref={frame}
        className={`relative mt-12 h-[600px] overflow-hidden md:h-[72svh] md:min-h-[460px] border-y border-rice/10 bg-ink-2 ${
          touched ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* wood-dark table texture */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#16201f,transparent_70%)]" />

        <motion.div
          className={`absolute left-0 top-0 ${small ? "touch-pan-y" : "touch-none"}`}
          style={{ width: W, height: H, x, y }}
          drag={small ? "x" : true}
          dragConstraints={{ left: minX, right: 0, top: minY, bottom: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.28, timeConstant: 320 }}
          onDragStart={() => {
            dragging.current = true
            setTouched(true)
          }}
          onDragEnd={() => {
            setTimeout(() => (dragging.current = false), 60)
          }}
        >
          {dishes.map((d, i) => (
            <Card
              key={d.id}
              dish={d}
              i={i}
              cols={cols}
              cellW={cellW}
              cellH={cellH}
              small={small}
              x={x}
              y={y}
              onOpen={() => !dragging.current && navigate(`/${loc.slug}/menu?piatto=${d.id}`)}
            />
          ))}
        </motion.div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />

        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-rice px-4 py-2 text-sm font-medium text-ink shadow-xl"
          animate={{ opacity: touched ? 0 : 1, y: touched ? 10 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-drag-move-2-line" aria-hidden />
          Trascina
        </motion.div>
      </div>
    </section>
  )
}

function Card({
  dish,
  i,
  cols,
  cellW,
  cellH,
  small,
  x,
  y,
  onOpen,
}: {
  dish: Dish
  i: number
  cols: number
  cellW: number
  cellH: number
  small: boolean
  x: MotionValue<number>
  y: MotionValue<number>
  onOpen: () => void
}) {
  const col = i % cols
  const row = Math.floor(i / cols)
  const size = (small ? 120 : 190) + rand(i, 1) * (small ? 50 : 80)
  const left = col * cellW + (row % 2 ? cellW / 2 : 0) + rand(i, 2) * (cellW - size)
  const top = row * cellH + rand(i, 3) * (cellH - size * 0.95)
  const rot = (rand(i, 4) - 0.5) * 8
  const depth = 0.04 + rand(i, 5) * 0.1

  /* cards drift at different rates while the table moves: cheap depth */
  const px = useTransform(x, (v) => v * depth)
  const py = useTransform(y, (v) => v * depth)

  return (
    <motion.div className="absolute" style={{ left, top, width: size, x: px, y: py }}>
      <motion.button
        type="button"
        onClick={onOpen}
        className="group block w-full cursor-pointer text-left"
        initial={{ opacity: 0, scale: 0.9, rotate: rot }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "100px" }}
        whileHover={{ rotate: 0, scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
        aria-label={`${dish.num}. ${dish.name}`}
      >
        <span className="relative block overflow-hidden rounded-xl bg-ink-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,.8)] ring-1 ring-rice/10">
          <img src={dish.img!} alt="" loading="lazy" draggable={false} className="aspect-[3/2] w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-rice backdrop-blur">
            N° {dish.num}
          </span>
        </span>
        <span className="mt-2 block truncate text-sm font-medium text-rice/85 transition-colors group-hover:text-teal-hi">
          {dish.name}
        </span>
      </motion.button>
    </motion.div>
  )
}
