import type { Category, Dish } from "./hooks"

const NOT_FOOD = /bevande|birra|bianco|rosso|rosat|rose|spumante|bollicine|bubble|box/

/** Food dishes with a photo, interleaved across categories so neighbours differ */
export function pickDishes(menu: Category[], n: number): Dish[] {
  const pools = menu
    .filter((c) => !NOT_FOOD.test(c.id))
    .map((c) => c.items.filter((d) => d.img && d.num))
    .filter((p) => p.length)
  const out: Dish[] = []
  let round = 0
  while (out.length < n && pools.some((p) => p[round])) {
    for (const p of pools) {
      if (p[round] && out.length < n) out.push(p[round])
    }
    round++
  }
  return out
}

export const countDishes = (menu: Category[]) =>
  menu.filter((c) => !NOT_FOOD.test(c.id)).reduce((a, c) => a + c.items.length, 0)

export const isFoodCategory = (c: Category) => !NOT_FOOD.test(c.id)
