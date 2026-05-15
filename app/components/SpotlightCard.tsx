export default function SpotlightCard({ flower }: any) {
  return (
    <div className="cozy-card mb-10 overflow-hidden bg-gradient-to-r from-pink-100 via-fuchsia-100 to-purple-100 p-8">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.3em] text-pink-500">
            ✨ Destaque da Guilda
          </p>

          <h2 className="text-5xl font-black text-zinc-900">
            {flower.name}
          </h2>

          <p className="mt-4 text-lg font-bold text-purple-700">
            {flower.rarity} • {flower.origin}
          </p>

          <div className="mt-8 flex gap-4">
            <div className="cozy-card bg-white px-5 py-4">
              <p className="text-sm text-zinc-500">
                ⭐ Pontos
              </p>

              <h3 className="text-3xl font-black text-pink-500">
                {flower.points}
              </h3>
            </div>

            <div className="cozy-card bg-white px-5 py-4">
              <p className="text-sm text-zinc-500">
                👥 Donos
              </p>

              <h3 className="text-3xl font-black text-purple-500">
                {flower.owners}
              </h3>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl">
          {flower.image ? (
            <img
              src={flower.image}
              alt={flower.name}
              className="h-[420px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-9xl">
              🌸
            </div>
          )}
        </div>
      </div>
    </div>
  )
}