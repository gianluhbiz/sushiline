import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useState, type ReactNode } from "react"
import { Link } from "react-router"
import type { Location } from "../data/locations"
import { useStatus } from "../lib/hooks"
import { StatusDot } from "./StatusDot"

export function Nav({ loc, onMenu = false, right }: { loc: Location; onMenu?: boolean; right?: ReactNode }) {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40))
  const st = useStatus(loc)

  return (
    <motion.nav
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? "border-b border-rice/10 bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 md:h-20 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={onMenu ? `/${loc.slug}` : "/"} className="shrink-0" aria-label={onMenu ? `Torna a ${loc.name}` : "Scegli un'altra sede"}>
            <img src="/img/logo.png" alt="Sushi Line" className="h-9 w-auto md:h-11" />
          </Link>
          <div className="hidden min-w-0 border-l border-rice/15 pl-3 sm:block">
            <Link to="/" className="group flex items-center gap-1 font-display text-lg font-extrabold uppercase leading-none tracking-wide text-rice">
              {loc.name}
              <i className="ri-arrow-left-right-line text-sm text-rice/40 transition-colors group-hover:text-teal-hi" aria-hidden />
              <span className="sr-only">cambia sede</span>
            </Link>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-rice/55">
              <StatusDot open={st.open} />
              {st.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {right}
          {!onMenu && (
            <Link
              to={`/${loc.slug}/menu`}
              className="flex h-11 items-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97]"
            >
              <i className="ri-restaurant-2-line text-base" aria-hidden />
              Menu
            </Link>
          )}
          <a
            href={loc.phoneHref}
            className="grid size-11 place-items-center rounded-full border border-rice/20 text-lg text-rice transition-[background-color,border-color,transform] duration-200 hover:border-rice/50 hover:bg-rice/5 active:scale-[0.97]"
            aria-label={`Chiama Sushi Line ${loc.name}, ${loc.phone}`}
          >
            <i className="ri-phone-line" aria-hidden />
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
