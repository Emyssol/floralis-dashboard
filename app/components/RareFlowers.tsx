export default function RareFlowers({ flowers }: any) {
  const rareFlowers = flowers
    .filter((flower: any) =>
      flower.rarity?.includes("UR") ||
      flower.rarity?.includes("SSR")
    )
    .slice(0, 6)

  return (
    <div className="cozy-card bg-white p-6">
      <h2 className="mb-6 text-3xl font-black text-purple-500">
        💎 Flores Raras
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rareFlowers.map((flower: any) => (
          <div
            key={flower.id}
            className="rounded-2xl bg-purple-50 p-4"
          >
            <h3 className="font-black text-zinc-900">
              {flower.name}
            </h3>

            <p className="mt-2 font-bold text-purple-600">
              {flower.rarity}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}