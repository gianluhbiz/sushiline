import type { ReactNode } from "react"

export function SectionLabel({ kanji, children }: { kanji: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-teal-hi">
      <span className="grid size-8 place-items-center rounded-full font-jp text-sm text-rice ring-1 ring-rice/20">{kanji}</span>
      {children}
    </p>
  )
}
