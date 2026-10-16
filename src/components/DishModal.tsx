import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { ALLERGENS, type Dish } from "../lib/hooks"

const outStrong = [0.23, 1, 0.32, 1] as const

export function DishModal({ dish, qty, onAdd, onRemove, onClose }: { dish: Dish; qty: number; onAdd: () => void; onRemove: () => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
      prev?.focus({ preventScroll: true })
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="dish-title">
      <motion.div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
      />
      <motion.div
        className="no-scrollbar relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-ink-2 ring-1 ring-rice/15 md:rounded-3xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0, transition: { duration: 0.18 } }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.12 }}
      >
        <motion.div layoutId={`img-${dish.id}`} className="relative aspect-[3/2] overflow-hidden bg-ink-3">
          {dish.img && <img src={dish.img} alt={dish.name} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-transparent to-transparent" />
        </motion.div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-ink/80 text-xl text-rice backdrop-blur transition-transform active:scale-90"
        >
          <i className="ri-close-line" aria-hidden />
        </button>

        <motion.div
          className="relative -mt-16 px-6 pb-8 md:px-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: outStrong }}
        >
          {dish.num && <p className="font-display text-7xl font-black leading-none text-teal-hi md:text-8xl">{dish.num}</p>}
          <h2 id="dish-title" className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
            {dish.name}
          </h2>
          <p className="mt-2 flex flex-wrap gap-x-4 font-mono text-xs uppercase tracking-wider text-rice/50">
            {dish.pz && <span>{dish.pz} pezzi</span>}
            {dish.spicy && (
              <span className="text-salmon">
                <i className="ri-fire-fill" aria-hidden /> Piccante
              </span>
            )}
            {dish.price && <span className="text-rice">{dish.price} €</span>}
          </p>
          {dish.desc && <p className="mt-5 text-lg leading-relaxed text-rice/80">{dish.desc}</p>}

          {dish.al.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-rice/45">Allergeni</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {dish.al.map((n) => (
                  <li key={n} className="rounded-full px-3 py-1 text-sm text-rice/85 ring-1 ring-rice/15">
                    <span className="mr-1.5 font-mono text-xs text-teal-hi">{n}</span>
                    {ALLERGENS[n]}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dish.desc.includes("*") && <p className="mt-4 text-xs text-rice/40">* ingrediente surgelato</p>}

          {dish.num && (
            <div className="mt-8 flex items-center gap-3">
              {qty > 0 ? (
                <div className="flex h-14 flex-1 items-center justify-between rounded-full bg-rice px-2 text-ink">
                  <button type="button" onClick={onRemove} aria-label="Togli uno" className="grid size-11 place-items-center rounded-full text-xl active:scale-90">
                    <i className="ri-subtract-line" aria-hidden />
                  </button>
                  <span className="font-semibold">
                    {qty} nella lista
                  </span>
                  <button type="button" onClick={onAdd} aria-label="Aggiungi uno" className="grid size-11 place-items-center rounded-full bg-teal text-xl active:scale-90">
                    <i className="ri-add-line" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-teal font-semibold text-ink transition-[background-color,transform] duration-200 hover:bg-teal-hi active:scale-[0.97]"
                >
                  <i className="ri-add-line text-xl" aria-hidden />
                  Aggiungi alla mia lista
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
