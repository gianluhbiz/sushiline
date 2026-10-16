export function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex size-2 shrink-0">
      {open && <span className="absolute inset-0 animate-ping rounded-full bg-teal-hi opacity-60 motion-reduce:animate-none" />}
      <span className={`relative size-2 rounded-full ${open ? "bg-teal-hi" : "bg-salmon"}`} />
    </span>
  )
}
