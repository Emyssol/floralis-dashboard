export default function PopularFlowers({ flowers }: any) {
  const sorted = [...flowers]
    .sort((a, b) => b.owners - a.owners)
    .slice(0, 5)

  return (
    <div className="cozy-card bg-white p-6">
      <h2 className="mb-6 text-3xl font-black text-pink-500">
        🌻 Mais Populares
      </h2>

      <div className="space-y-4">
        {sorted.map((flower, index) => (
          <div
            key={flower.id}
            className="flex items-center gap-4 rounded-2xl bg-pink-50 p-4"
          >
            <div className="text-2xl font-black text-pink-500">
              #{index + 1}
            </div>

            <div className="flex-1">
              <h3 className="font-black text-zinc-900">
                {flower.name}
              </h3>

              <p className="text-sm text-zinc-500">
                {flower.owners} floristas possuem
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}