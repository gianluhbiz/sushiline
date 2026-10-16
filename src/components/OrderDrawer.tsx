import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import type { Location } from "../data/locations"
import { useMediaQuery, useOrder, type Dish } from "../lib/hooks"

const numKey = (n: string | null) => parseFloat(n ?? "9999")

export function OrderDrawer({ loc, byId, onClose, onOpenDish }: { loc: Location; byId: Map<string, Dish>; onClose: () => void; onOpenDish: (id: string) => void }) {
  const { order, count, add, remove, clear } = useOrder(loc.slug)
  const desktop = useMediaQuery("(min-width: 768px)")
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const rows = Object.entries(order)
    .map(([id, qty]) => ({ dish: byId.get(id), qty, id }))
    .filter((r): r is { dish: Dish; qty: number; id: string } => !!r.dish)
    .sort((a, b) => numKey(a.dish.num) - numKey(b.dish.num))

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const copy = async () => {
    const text = rows.map((r) => `${r.dish.num} x${r.qty}`).join(", ")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked: nothing to do */
    }
  }

  const hidden = desktop ? { x: "100%" } : { y: "100%" }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="lista-title">
      <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside
        className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-3xl bg-rice text-ink md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none"
        initial={hidden}
        animate={{ x: 0, y: 0 }}
        exit={{ ...hidden, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50">Sushi Line {loc.name}</p>
            <h2 id="lista-title" className="font-display text-5xl font-black uppercase leading-none">
              La mia lista
            </h2>
            <p className="mt-1 text-sm text-ink/60">{count ? `${count} piatti segnati` : "Ancora vuota"}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Chiudi la lista" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-xl text-rice active:scale-90">
            <i className="ri-close-line" aria-hidden />
          </button>
        </div>

        <div className="receipt-edge h-3 bg-ink/5" />

        <ul className="flex-1 overflow-y-auto px-6 py-2">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-dashed border-ink/20 py-3">
                  <button type="button" onClick={() => onOpenDish(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="w-14 shrink-0 font-display text-4xl font-black leading-none">{r.dish.num}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.dish.name}</span>
                      {r.dish.pz && <span className="font-mono text-[11px] uppercase text-ink/50">{r.dish.pz} pz a porzione</span>}
                    </span>
                  </button>
                  <div className="flex items-center rounded-full ring-1 ring-ink/15">
                    <button type="button" onClick={() => remove(r.id)} aria-label={`Togli ${r.dish.name}`} className="grid size-10 place-items-center text-lg active:scale-90">
                      <i className="ri-subtract-line" aria-hidden />
                    </button>
                    <span className="w-6 text-center font-mono tabular-nums">{r.qty}</span>
                    <button type="button" onClick={() => add(r.id)} aria-label={`Aggiungi ${r.dish.name}`} className="grid size-10 place-items-center text-lg active:scale-90">
                      <i className="ri-add-line" aria-hidden />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {!rows.length && (
            <li className="py-16 text-center">
              <p className="font-serif text-3xl italic">Nessun piatto, per ora.</p>
              <p className="mt-2 text-sm text-ink/60">Premi + su un piatto del menu per segnarlo qui.</p>
            </li>
          )}
        </ul>

        {rows.length > 0 && (
          <div className="border-t border-ink/10 p-6">
            <p className="mb-4 text-sm text-ink/60">Al tavolo leggi i numeri a chi prende l'ordinazione. La lista resta salvata su questo dispositivo.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-ink font-semibold text-rice active:scale-[0.97]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? "y" : "n"}
                    className="flex items-center gap-2"
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className={copied ? "ri-check-line" : "ri-file-copy-line"} aria-hidden />
                    {copied ? "Copiati" : "Copia i numeri"}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button type="button" onClick={clear} className="h-12 rounded-full px-5 text-sm font-medium ring-1 ring-ink/20 active:scale-[0.97]">
                Svuota
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    </div>
  )
}
