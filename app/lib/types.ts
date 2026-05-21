export interface Flower {
  id: string
  name: string
  rarity: string
  origin: string
  points:   number
  diamonds: number
  owners:   number
  image: string | null
}

export interface Member {
  id: string
  name: string
  cargo: string
  status: string
  lastEdited: string        // ISO 8601 — last_edited_time do Notion
  birthday: string | null   // "YYYY-MM-DD" ou null
  avatar: string | null
  bio: string
  flowers: string[]         // nomes das flores possuídas
  favorites: string[]       // nomes das flores para competição
}