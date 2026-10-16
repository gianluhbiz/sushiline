import { AnimatePresence, MotionConfig } from "framer-motion"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router"
import LocationPage from "./pages/LocationPage"
import MenuPage from "./pages/MenuPage"
import Picker from "./pages/Picker"

if (typeof window !== "undefined" && "scrollRestoration" in history) history.scrollRestoration = "manual"

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Picker />} />
        <Route path="/:slug" element={<LocationPage />} />
        <Route path="/:slug/menu" element={<MenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  )
}
