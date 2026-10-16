export type Slug = "olbia" | "nuoro" | "sassari"

/** Opening windows in minutes from midnight, e.g. [720, 900] = 12:00–15:00 */
export type Window = [number, number]

export type Prices = {
  lunch: [number, number]
  dinner: [number, number]
  kidsLunch: [number, number]
  kidsDinner: [number, number]
  cover: number
}

export type Location = {
  slug: Slug
  index: string
  kanji: string
  name: string
  area: string
  street: string
  city: string
  phone: string
  phoneHref: string
  hours: { weekday: Window[]; sunday: Window[] }
  prices: Prices
  rating?: { score: number; count: number }
  takeaway: string
  delivery?: string
  maps: string
  facebook?: string
  instagram?: string
  hero: string
  gallery: string[]
  blurb: string
}

const h = (hh: number, mm = 0) => hh * 60 + mm

export const CONTACTS = {
  whatsapp: "https://wa.me/393335380584",
  whatsappLabel: "+39 333 538 0584",
  email: "info@sushiline.net",
}

export const LOCATIONS: Location[] = [
  {
    slug: "olbia",
    index: "01",
    kanji: "壱",
    name: "Olbia",
    area: "Zona industriale",
    street: "SS 125 Orientale Sarda, 16/4",
    city: "07026 Olbia (SS)",
    phone: "0789 1980958",
    phoneHref: "tel:+3907891980958",
    hours: {
      weekday: [[h(12), h(15)], [h(19), h(23)]],
      sunday: [[h(12), h(15)], [h(19), h(22, 30)]],
    },
    prices: { lunch: [14.9, 16.9], dinner: [26.9, 28.9], kidsLunch: [8.9, 10.9], kidsDinner: [12.9, 14.9], cover: 2 },
    rating: { score: 4.5, count: 1577 },
    takeaway: "https://takeaway.tablemi.com/0d5e7ac3ef18cf5ad317071d?lang=it",
    delivery: "https://delivery.tablemi.com/0d5e7ac3ef18cf5ad317071d?lang=it",
    maps: "https://www.google.com/maps/search/?api=1&query=Sushi%20Line%20-%20Olbia&query_place_id=ChIJdx9p_gRL2RIRHeiGOUD_9DA",
    facebook: "https://www.facebook.com/sushilineolbia",
    hero: "/img/olbia-1.jpg",
    gallery: [1, 2, 3, 4, 5, 6].map((i) => `/img/olbia-${i}.jpg`),
    blurb: "Sulla Orientale Sarda, in zona industriale. Unica sede con consegna a domicilio.",
  },
  {
    slug: "nuoro",
    index: "02",
    kanji: "弐",
    name: "Nuoro",
    area: "Nuova zona commerciale",
    street: "Via Vincenzo Marongiu, snc",
    city: "08100 Nuoro (NU)",
    phone: "0784 201485",
    phoneHref: "tel:+390784201485",
    hours: {
      weekday: [[h(12), h(15)], [h(19, 30), h(23)]],
      sunday: [[h(12), h(15)], [h(19), h(22, 30)]],
    },
    prices: { lunch: [13.9, 15.9], dinner: [25.9, 27.9], kidsLunch: [8.9, 10.9], kidsDinner: [12.9, 14.9], cover: 2 },
    rating: { score: 4.5, count: 937 },
    takeaway: "https://takeaway.tablemi.com/ab5dddc6893ccc95e97b7f76?lang=it",
    maps: "https://www.google.com/maps/search/?api=1&query=Sushi%20Line%20-%20Nuoro&query_place_id=ChIJJ7bZrnmH3hIR4h-jJ4YJ18g",
    facebook: "https://www.facebook.com/sushilinesrl/",
    instagram: "https://www.instagram.com/sushiline_nuoro",
    hero: "/img/nuoro-4.jpg",
    gallery: [1, 2, 3, 4, 5, 6].map((i) => `/img/nuoro-${i}.jpg`),
    blurb: "In via Marongiu, nella nuova zona commerciale. Qui il pranzo costa un euro in meno.",
  },
  {
    slug: "sassari",
    index: "03",
    kanji: "参",
    name: "Sassari",
    area: "Predda Niedda",
    street: "Via Predda Niedda, Strada 2",
    city: "07100 Sassari (SS)",
    phone: "079 9897968",
    phoneHref: "tel:+390799897968",
    hours: {
      weekday: [[h(12, 30), h(15, 30)], [h(19, 30), h(23, 30)]],
      sunday: [[h(12, 30), h(15, 30)], [h(19, 30), h(23)]],
    },
    prices: { lunch: [14.9, 16.9], dinner: [26.9, 28.9], kidsLunch: [8.9, 10.9], kidsDinner: [12.9, 14.9], cover: 2 },
    takeaway: "https://takeaway.tablemi.com/27ae2bd20046a1e49d149172?lang=it",
    maps: "https://www.google.com/maps/search/?api=1&query=Sushi%20Line%20-%20Sassari&query_place_id=ChIJyS4XgIhj3BIRCDN2-JnmjXc",
    facebook: "https://www.facebook.com/sushilinesassari",
    instagram: "https://www.instagram.com/sushiline_sassari",
    hero: "/img/sassari-3.jpg",
    gallery: [1, 2, 3, 4, 5, 6].map((i) => `/img/sassari-${i}.jpg`),
    blurb: "La sede di Predda Niedda. Cucina aperta fino alle 23:30, la più tardi delle tre.",
  },
]

export const getLocation = (slug?: string) => LOCATIONS.find((l) => l.slug === slug)
