import { motion } from "framer-motion"
import { useState, type ReactNode } from "react"
import { CONTACTS, type Location } from "../data/locations"
import { useNow } from "../lib/hooks"
import { DAYS, fmtRange, status, windowsFor } from "../lib/time"
import { SectionLabel } from "./SectionLabel"
import { StatusDot } from "./StatusDot"

const R = 132
const C = 160
const polar = (min: number, r: number) => {
  const a = (min / 1440) * Math.PI * 2 - Math.PI / 2
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const
}
const arc = (a: number, b: number, r: number) => {
  const [x1, y1] = polar(a, r)
  const [x2, y2] = polar(b, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${b - a > 720 ? 1 : 0} 1 ${x2} ${y2}`
}
/* Monday first, as on Italian calendars */
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export function HoursClock({ loc }: { loc: Location }) {
  const now = useNow()
  const [day, setDay] = useState(now.day)
  const st = status(loc, now)
  const wins = windowsFor(loc, day)
  const isToday = day === now.day
  const [hx, hy] = polar(now.minutes, R - 30)

  return (
    <section className="relative px-5 py-28 md:px-10 md:py-40" aria-labelledby="orari-title">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[auto_1fr] lg:gap-24">
        <div className="mx-auto w-full max-w-[400px]">
          <svg viewBox="0 0 320 320" className="w-full" role="img" aria-label={`Orari di ${DAYS[day]}: ${wins.map(fmtRange).join(" e ")}`}>
            <circle cx={C} cy={C} r={R + 18} fill="#111515" stroke="rgba(243,238,228,.1)" />
            <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(243,238,228,.06)" strokeWidth={20} />
            {Array.from({ length: 96 }, (_, i) => {
              const major = i % 4 === 0
              const [x1, y1] = polar(i * 15, R + 14)
              const [x2, y2] = polar(i * 15, R + (major ? 6 : 10))
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? "rgba(243,238,228,.45)" : "rgba(243,238,228,.15)"} strokeWidth={major ? 1.5 : 1} />
            })}
            {[0, 6, 12, 18].map((hr) => {
              const [x, y] = polar(hr * 60, R - 30)
              return (
                <text key={hr} x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-rice/40 font-mono text-[11px]">
                  {String(hr).padStart(2, "0")}
                </text>
              )
            })}
            {wins.map(([a, b], i) => (
              <motion.path
                key={`${day}-${i}`}
                d={arc(a, b, R)}
                fill="none"
                stroke={i === 0 ? "#3fc7c8" : "#ff7a4d"}
                strokeWidth={20}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.15, ease: [0.77, 0, 0.175, 1] }}
              />
            ))}
            {isToday && (
              <g>
                <line x1={C} y1={C} x2={hx} y2={hy} stroke="#f3eee4" strokeWidth={2} strokeLinecap="round" />
                <circle cx={hx} cy={hy} r={4} fill="#f3eee4" />
              </g>
            )}
            <circle cx={C} cy={C} r={5} fill="#f3eee4" />
          </svg>
          <div className="mt-4 flex justify-center gap-4 font-mono text-[11px] uppercase tracking-wider text-rice/55">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-hi" /> Pranzo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-salmon" /> Cena
            </span>
          </div>
        </div>

        <div>
          <SectionLabel kanji="時">Orari e indirizzo</SectionLabel>
          <h2 id="orari-title" className="mt-5 font-display text-[clamp(44px,6.5vw,104px)] font-black uppercase leading-[0.86] tracking-tight">
            {st.open ? "Siamo aperti." : "Ora chiusi."}
          </h2>
          <p className="mt-3 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-rice/60">
            <StatusDot open={st.open} />
            {st.label}
          </p>

          <div className="mt-8 flex flex-wrap gap-1.5" role="tablist" aria-label="Giorno della settimana">
            {ORDER.map((d) => (
              <button
                key={d}
                role="tab"
                type="button"
                aria-selected={day === d}
                onClick={() => setDay(d)}
                className={`relative h-11 min-w-11 rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
                  day === d ? "text-ink" : "text-rice/70 ring-1 ring-rice/15 hover:text-rice"
                }`}
              >
                {day === d && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-full bg-rice" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
                <span className="relative">
                  {DAYS[d].slice(0, 3)}
                  {d === now.day && <span className="ml-1 text-[10px] opacity-60">oggi</span>}
                </span>
              </button>
            ))}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-rice/10 py-5 font-mono">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-rice/45">Pranzo</dt>
              <dd className="mt-1 text-xl text-teal-hi">{fmtRange(wins[0])}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-rice/45">Cena</dt>
              <dd className="mt-1 text-xl text-salmon">{fmtRange(wins[1])}</dd>
            </div>
          </dl>

          <address className="mt-8 not-italic">
            <p className="text-xl text-rice md:text-2xl">{loc.street}</p>
            <p className="text-rice/60">{loc.city}</p>
          </address>
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill href={loc.maps} icon="ri-map-pin-2-line" primary>
              Portami lì
            </Pill>
            <Pill href={loc.phoneHref} icon="ri-phone-line">
              {loc.phone}
            </Pill>
            <Pill href={CONTACTS.whatsapp} icon="ri-whatsapp-line">
              WhatsApp
            </Pill>
            {loc.instagram && <Pill href={loc.instagram} icon="ri-instagram-line" label="Instagram" />}
            {loc.facebook && <Pill href={loc.facebook} icon="ri-facebook-circle-line" label="Facebook" />}
          </div>
        </div>
      </div>
    </section>
  )
}

function Pill({ href, icon, children, primary, label }: { href: string; icon: string; children?: ReactNode; primary?: boolean; label?: string }) {
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={label}
      className={`flex h-12 items-center gap-2 rounded-full text-sm font-medium transition-[background-color,transform] duration-200 active:scale-[0.97] ${
        children ? "px-5" : "w-12 justify-center"
      } ${primary ? "bg-rice text-ink hover:bg-white" : "text-rice ring-1 ring-rice/20 hover:bg-rice/10"}`}
    >
      <i className={`${icon} text-lg`} aria-hidden />
      {children}
    </a>
  )
}
