import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useLocation } from "react-router"

const STRIPS = 5
const ease = [0.77, 0, 0.175, 1] as const

/**
 * Route wrapper. On exit, five noren strips drop from the top and cover the
 * page, staggered left to right; once the next route mounts
 * (AnimatePresence mode="wait") they keep falling and leave from the bottom.
 * The very first page load skips the reveal.
 */
export function Page({ children }: { children: ReactNode }) {
  const navigated = useLocation().key !== "default"
  const strip = (i: number) => `h-full flex-1 ${i % 2 ? "bg-[#1a8f94]" : "bg-teal"}`

  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.8 } }}>
      {children}
      {navigated && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] flex">
          {Array.from({ length: STRIPS }, (_, i) => (
            <motion.div
              key={i}
              className={`${strip(i)} origin-bottom`}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0, transition: { duration: 0.6, delay: 0.08 + i * 0.05, ease } }}
              exit={{ scaleY: 0 }}
            />
          ))}
        </div>
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] flex">
        {Array.from({ length: STRIPS }, (_, i) => (
          <motion.div
            key={i}
            className={`${strip(i)} origin-top`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1, transition: { duration: 0.5, delay: i * 0.05, ease } }}
          />
        ))}
      </div>
    </motion.div>
  )
}
