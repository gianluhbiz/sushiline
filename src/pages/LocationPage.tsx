import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"
import { Navigate, useLocation, useParams } from "react-router"
import { ConveyorHero } from "../components/ConveyorHero"
import { DishTable } from "../components/DishTable"
import { HoursClock } from "../components/HoursClock"
import { Nav } from "../components/Nav"
import { OtherLines } from "../components/OtherLines"
import { Page } from "../components/Page"
import { Receipt } from "../components/Receipt"
import { RoomDeck } from "../components/RoomDeck"
import { getLocation, type Location } from "../data/locations"
import { countDishes, pickDishes } from "../lib/dishes"
import { useMenu, type Dish } from "../lib/hooks"

export default function LocationPage() {
  const { slug } = useParams()
  const loc = getLocation(slug)
  const state = useLocation().state as { from?: string } | null
  if (!loc) return <Navigate to="/" replace />
  return <Inner key={loc.slug} loc={loc} fromPicker={state?.from === "picker"} />
}

function Inner({ loc, fromPicker }: { loc: Location; fromPicker: boolean }) {
  const menu = useMenu(loc.slug)
  const picks = useMemo(() => (menu ? pickDishes(menu, 72) : []), [menu])
  const total = menu ? countDishes(menu) : 0

  useEffect(() => {
    document.title = `Sushi Line ${loc.name} · All you can eat`
  }, [loc.name])

  return (
    <Page>
      <Nav loc={loc} />
      <main>
        <ConveyorHero loc={loc} dishes={picks.slice(0, 26)} fromPicker={fromPicker} />
        <Ticker dishes={picks.slice(26, 46)} />
        <Receipt loc={loc} />
        <DishTable loc={loc} dishes={picks.slice(0, 54)} total={total} />
        <RoomDeck loc={loc} />
        <HoursClock loc={loc} />
        <OtherLines loc={loc} />
      </main>
    </Page>
  )
}

/** Two rows of dish names sliding against each other as you scroll */
function Ticker({ dishes }: { dishes: Dish[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const a = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"])
  const b = useTransform(scrollYProgress, [0, 1], ["-35%", "0%"])
  if (!dishes.length) return <div className="h-40" />
  const half = Math.ceil(dishes.length / 2)
  const rows = [dishes.slice(0, half), dishes.slice(half)]

  return (
    <div ref={ref} aria-hidden className="relative -rotate-2 overflow-hidden border-y border-rice/10 bg-teal py-4 text-ink md:py-6">
      {rows.map((row, r) => (
        <motion.div key={r} style={{ x: r ? b : a }} className="flex w-max items-center gap-6 whitespace-nowrap py-1 md:gap-10">
          {[...row, ...row].map((d, i) => (
            <span key={i} className="flex items-center gap-6 md:gap-10">
              <span className="font-display text-4xl font-black uppercase leading-none tracking-tight md:text-7xl">{d.name}</span>
              <img src={d.img!} alt="" loading="lazy" className="h-10 w-14 rounded-full object-cover ring-2 ring-ink md:h-14 md:w-20" />
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  )
}
