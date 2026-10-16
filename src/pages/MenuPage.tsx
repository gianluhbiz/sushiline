import { AnimatePresence, motion } from "framer-motion"
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { Link, Navigate, useParams, useSearchParams } from "react-router"
import { DishModal } from "../components/DishModal"
import { Nav } from "../components/Nav"
import { OrderDrawer } from "../components/OrderDrawer"
import { Page } from "../components/Page"
import { getLocation, type Location } from "../data/locations"
import { isFoodCategory } from "../lib/dishes"
import { ALLERGENS, useMenu, useOrder, type Category, type Dish } from "../lib/hooks"
import { euro } from "../lib/time"

const outStrong = [0.23, 1, 0.32, 1] as const

export default function MenuPage() {
  const loc = getLocation(useParams().slug)
  if (!loc) return <Navigate to="/" replace />
  return <MenuInner key={loc.slug} loc={loc} />
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

function MenuInner({ loc }: { loc: Location }) {
  const menu = useMenu(loc.slug)
  const [params, setParams] = useSearchParams()
  const openId = params.get("piatto")
  const [q, setQ] = useState("")
  const query = useDeferredValue(q)
  const [spicy, setSpicy] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const { order, count, add, remove } = useOrder(loc.slug)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    document.title = `Menu · Sushi Line ${loc.name}`
  }, [loc.name])

  const byId = useMemo(() => {
    const m = new Map<string, Dish>()
    menu?.forEach((c) => c.items.forEach((d) => m.set(d.id, d)))
    return m
  }, [menu])

  const shown: Category[] = useMemo(() => {
    if (!menu) return []
    const nq = norm(query.trim())
    return menu
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (d) => (!spicy || d.spicy) && (!nq || norm(`${d.num ?? ""} ${d.name} ${d.desc}`).includes(nq) || d.num === nq),
        ),
      }))
      .filter((c) => c.items.length)
  }, [menu, query, spicy])

  /* scroll-spy for the category index */
  useEffect(() => {
    const els = shown.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id.slice(4))
      },
      { rootMargin: "-25% 0px -65% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [shown])

  const jump = (id: string) => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  const open = (id: string) => setParams({ piatto: id }, { preventScrollReset: true })
  const close = () => setParams({}, { replace: true, preventScrollReset: true })
  const openDish = openId ? byId.get(openId) : undefined
  const total = menu ? menu.reduce((a, c) => a + c.items.filter((d) => d.num).length, 0) : 0

  const listButton = (
    <button
      type="button"
      onClick={() => setListOpen(true)}
      className="relative flex h-11 items-center gap-2 rounded-full bg-rice px-4 text-sm font-semibold text-ink transition-transform duration-200 active:scale-[0.97]"
    >
      <i className="ri-file-list-3-line text-base" aria-hidden />
      <span className="hidden sm:inline">La mia lista</span>
      <motion.span
        key={count}
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.4 }}
        className="grid h-6 min-w-6 place-items-center rounded-full bg-salmon px-1.5 font-mono text-xs text-ink"
      >
        {count}
      </motion.span>
    </button>
  )

  return (
    <Page>
      <Nav loc={loc} onMenu right={listButton} />

      <header className="relative overflow-hidden px-4 pb-10 pt-28 md:px-8 md:pb-16 md:pt-36">
        <div className="mx-auto max-w-[1400px]">
          <Link to={`/${loc.slug}`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-rice/55 transition-colors hover:text-teal-hi">
            <i className="ri-arrow-left-line" aria-hidden /> Sushi Line {loc.name}
          </Link>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="font-display text-[clamp(88px,17vw,280px)] font-black uppercase leading-[0.78] tracking-tight">
              <motion.span className="block" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.35, ease: outStrong }}>
                Menu
              </motion.span>
            </h1>
            <motion.div
              className="max-w-md lg:pb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: outStrong }}
            >
              <p className="font-serif text-3xl italic leading-tight text-teal-hi md:text-4xl">{total || "Tanti"} piatti numerati.</p>
              <p className="mt-3 text-base leading-relaxed text-rice/65">
                Ordini per numero, senza limite. Premi + sui piatti che ti ispirano: li ritrovi in <em className="not-italic text-rice">La mia lista</em>, pronti
                da dettare al tavolo.
              </p>
              <dl className="mt-5 flex gap-6 font-mono text-xs uppercase tracking-wider text-rice/50">
                <div>
                  <dt>Pranzo</dt>
                  <dd className="text-lg text-rice">{euro(loc.prices.lunch[0])} €</dd>
                </div>
                <div>
                  <dt>Cena</dt>
                  <dd className="text-lg text-rice">{euro(loc.prices.dinner[0])} €</dd>
                </div>
                <div>
                  <dt>Weekend</dt>
                  <dd className="text-lg text-rice">+2,00 €</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </div>
      </header>

      {/* mobile: sticky search + category chips */}
      <div className="sticky top-16 z-30 border-y border-rice/10 bg-ink/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2 px-4 pt-3">
          <SearchBox q={q} setQ={setQ} />
          <SpicyToggle on={spicy} set={setSpicy} compact />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-3">
          {shown.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jump(c.id)}
              className={`relative h-9 shrink-0 rounded-full px-3.5 text-sm transition-colors ${active === c.id ? "text-ink" : "text-rice/70 ring-1 ring-rice/15"}`}
            >
              {active === c.id && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-rice" transition={{ type: "spring", duration: 0.35, bounce: 0.1 }} />}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-32 md:px-8 lg:grid-cols-[250px_1fr] lg:gap-14">
        {/* desktop index */}
        <aside className="hidden lg:block">
          <div className="no-scrollbar sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto pb-6">
            <SearchBox q={q} setQ={setQ} />
            <div className="mt-3">
              <SpicyToggle on={spicy} set={setSpicy} />
            </div>
            <nav className="mt-6" aria-label="Categorie">
              <ul>
                {shown.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => jump(c.id)}
                      className={`group relative flex w-full items-baseline gap-3 py-1.5 pl-4 text-left transition-colors ${active === c.id ? "text-rice" : "text-rice/45 hover:text-rice/80"}`}
                    >
                      {active === c.id && (
                        <motion.span layoutId="cat-bar" className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-teal-hi" transition={{ type: "spring", duration: 0.35, bounce: 0.1 }} />
                      )}
                      <span className="w-5 font-mono text-[10px] text-rice/30">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 font-display text-xl font-extrabold uppercase tracking-wide">{c.name}</span>
                      <span className="font-mono text-[10px] text-rice/30">{c.items.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 pt-6 lg:pt-0">
          {!menu && <Skeleton />}
          {menu && shown.length === 0 && (
            <div className="py-24 text-center">
              <p className="font-serif text-4xl italic text-rice/80">Nessun piatto trovato.</p>
              <button
                type="button"
                onClick={() => {
                  setQ("")
                  setSpicy(false)
                }}
                className="mt-6 h-11 rounded-full bg-rice px-5 text-sm font-semibold text-ink active:scale-[0.97]"
              >
                Azzera i filtri
              </button>
            </div>
          )}
          {shown.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-44 pb-16 lg:scroll-mt-28" aria-labelledby={`h-${c.id}`}>
              <div className="flex items-end justify-between gap-4 border-b border-rice/15 pb-3">
                <h2 id={`h-${c.id}`} className="font-display text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
                  {c.name}
                </h2>
                <span className="pb-1 font-mono text-xs text-rice/40">{c.items.length} voci</span>
              </div>
              {isFoodCategory(c) && c.items.some((d) => d.img) ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                  {c.items.map((d) => (
                    <DishCard key={d.id} dish={d} qty={order[d.id] ?? 0} onOpen={() => open(d.id)} onAdd={() => add(d.id)} onRemove={() => remove(d.id)} />
                  ))}
                </div>
              ) : (
                <ul className="mt-4 grid gap-x-10 md:grid-cols-2">
                  {c.items.map((d) => (
                    <DrinkRow key={d.id} dish={d} />
                  ))}
                </ul>
              )}
            </section>
          ))}

          {menu && (
            <section className="mt-8 rounded-2xl bg-ink-2 p-6 ring-1 ring-rice/10 md:p-8" aria-labelledby="allergeni">
              <h2 id="allergeni" className="font-display text-3xl font-black uppercase">
                Allergeni
              </h2>
              <p className="mt-2 text-sm text-rice/60">I numeri tra parentesi accanto a ogni piatto rimandano a questa legenda. L'asterisco (*) segnala ingredienti surgelati.</p>
              <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(ALLERGENS).map(([n, name]) => (
                  <li key={n} className="flex items-baseline gap-2">
                    <span className="w-5 font-mono text-xs text-teal-hi">{n}</span>
                    {name}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </main>
      </div>

      {/* mobile floating list button */}
      <AnimatePresence>
        {count > 0 && !listOpen && (
          <motion.button
            type="button"
            onClick={() => setListOpen(true)}
            className="fixed bottom-5 left-1/2 z-40 flex h-14 -translate-x-1/2 items-center gap-3 rounded-full bg-teal pl-5 pr-2 font-semibold text-ink shadow-2xl shadow-black/50 active:scale-[0.97] lg:hidden"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
          >
            La mia lista
            <span className="grid size-10 place-items-center rounded-full bg-ink font-mono text-sm text-rice">{count}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openDish && <DishModal key={openDish.id} dish={openDish} qty={order[openDish.id] ?? 0} onAdd={() => add(openDish.id)} onRemove={() => remove(openDish.id)} onClose={close} />}
      </AnimatePresence>
      <AnimatePresence>{listOpen && <OrderDrawer loc={loc} byId={byId} onClose={() => setListOpen(false)} onOpenDish={(id) => { setListOpen(false); open(id) }} />}</AnimatePresence>
    </Page>
  )
}

function SearchBox({ q, setQ }: { q: string; setQ: (s: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-ink-2 px-4 ring-1 ring-rice/15 focus-within:ring-teal-hi">
      <i className="ri-search-line text-rice/50" aria-hidden />
      <span className="sr-only">Cerca nel menu</span>
      <input
        ref={ref}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca: salmone, 53, tempura…"
        className="min-w-0 flex-1 bg-transparent text-base text-rice placeholder:text-rice/35 focus:outline-none lg:text-sm"
        type="search"
      />
      {q && (
        <button type="button" onClick={() => { setQ(""); ref.current?.focus() }} aria-label="Cancella ricerca" className="text-rice/50 hover:text-rice">
          <i className="ri-close-circle-fill" aria-hidden />
        </button>
      )}
    </label>
  )
}

function SpicyToggle({ on, set, compact }: { on: boolean; set: (b: boolean) => void; compact?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => set(!on)}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97] ${
        on ? "bg-salmon text-ink" : "text-rice/70 ring-1 ring-rice/15 hover:text-rice"
      } ${compact ? "" : "w-full justify-center"}`}
    >
      <i className={on ? "ri-fire-fill" : "ri-fire-line"} aria-hidden />
      {compact ? <span className="sr-only">Solo piccanti</span> : "Solo piccanti"}
    </button>
  )
}

function DishCard({ dish, qty, onOpen, onAdd, onRemove }: { dish: Dish; qty: number; onOpen: () => void; onAdd: () => void; onRemove: () => void }) {
  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-rice/10 transition-[box-shadow] duration-300 hover:ring-rice/25"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, ease: outStrong }}
    >
      <button type="button" onClick={onOpen} className="block w-full cursor-pointer text-left" aria-label={`${dish.num ?? ""} ${dish.name}: dettagli`}>
        <motion.div layoutId={`img-${dish.id}`} className="relative aspect-[3/2] overflow-hidden bg-ink-3">
          {dish.img ? (
            <img src={dish.img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.04]" />
          ) : (
            <div className="grid h-full place-items-center font-jp text-6xl text-rice/10">寿司</div>
          )}
          {dish.num && (
            <span className="absolute left-2 top-2 rounded-lg bg-ink/85 px-2 py-1 font-display text-xl sm:left-3 sm:top-3 sm:px-2.5 sm:text-2xl font-black leading-none text-rice backdrop-blur">
              {dish.num}
            </span>
          )}
        </motion.div>
        <div className="p-3 sm:p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold leading-snug text-rice sm:text-base">
            {dish.name}
            {dish.spicy && <i className="ri-fire-fill text-salmon" aria-label="piccante" />}
          </h3>
          <p className="mt-1 hidden text-sm leading-snug text-rice/55 sm:line-clamp-2">{dish.desc}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 sm:mt-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-rice/40">
            {dish.pz && <span>{dish.pz} pz</span>}
            {dish.al.length > 0 && <span>All. {dish.al.join(" · ")}</span>}
            {dish.price && <span className="text-rice/70">{dish.price} €</span>}
          </p>
        </div>
      </button>
      {dish.num && <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} name={dish.name} />}
    </motion.article>
  )
}

function QtyControl({ qty, onAdd, onRemove, name }: { qty: number; onAdd: () => void; onRemove: () => void; name: string }) {
  return (
    <div className="absolute right-2 top-2 flex items-center rounded-full bg-rice text-ink shadow-lg sm:right-3 sm:top-3">
      <AnimatePresence initial={false}>
        {qty > 0 && (
          <motion.div
            className="flex items-center overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: outStrong }}
          >
            <button type="button" onClick={onRemove} aria-label={`Togli ${name}`} className="grid size-10 place-items-center text-lg active:scale-90">
              <i className="ri-subtract-line" aria-hidden />
            </button>
            <span className="w-5 text-center font-mono text-sm font-medium tabular-nums">{qty}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Aggiungi ${name} alla lista`}
        className={`grid size-10 place-items-center rounded-full text-lg transition-[background-color,color,transform] duration-150 active:scale-90 ${qty > 0 ? "bg-teal text-ink" : ""}`}
      >
        <i className="ri-add-line" aria-hidden />
      </button>
    </div>
  )
}

function DrinkRow({ dish }: { dish: Dish }) {
  return (
    <li className="flex items-center gap-4 border-b border-rice/10 py-3">
      {dish.img ? (
        <img src={dish.img} alt="" loading="lazy" className="size-14 shrink-0 rounded-lg bg-rice object-contain p-1" />
      ) : (
        <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-ink-2 text-xl text-rice/30 ring-1 ring-rice/10">
          <i className="ri-goblet-line" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-rice">{dish.name}</p>
        {dish.desc && <p className="line-clamp-2 text-sm text-rice/50">{dish.desc}</p>}
      </div>
      {dish.price && <span className="font-mono text-sm text-rice">{dish.price} €</span>}
    </li>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-ink-2 ring-1 ring-rice/10">
          <div className="aspect-[3/2] animate-pulse bg-ink-3" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink-3" />
            <div className="h-3 w-full animate-pulse rounded bg-ink-3" />
          </div>
        </div>
      ))}
    </div>
  )
}
