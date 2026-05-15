export interface Flower {
  id: string
  name: string
  rarity: string
  origin: string
  points: number
  owners: number
  image: string | null
}

export interface Member {
  id: string
  name: string
  cargo: string
  status: string
  avatar: string | null
  bio: string
  favorites: string[]
  flowers: string[]
}
