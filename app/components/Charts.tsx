export default function Charts({ flowers }: any) {
  const ur = flowers.filter((f: any) =>
    f.rarity?.includes("UR")
  ).length

  const ssr = flowers.filter((f: any) =>
    f.rarity?.includes("SSR")
  ).length

  const sr = flowers.filter((f: any) =>
    f.rarity?.includes("SR")
  ).length

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="cozy-card bg-white p-6 text-center">
        <div className="text-5xl">❤️</div>

        <h2 className="mt-4 text-5xl font-black text-pink-500">
          {ur}
        </h2>

        <p className="mt-2 font-bold text-zinc-500">
          Flores UR
        </p>
      </div>

      <div className="cozy-card bg-white p-6 text-center">
        <div className="text-5xl">💛</div>

        <h2 className="mt-4 text-5xl font-black text-amber-500">
          {ssr}
        </h2>

        <p className="mt-2 font-bold text-zinc-500">
          Flores SSR
        </p>
      </div>

      <div className="cozy-card bg-white p-6 text-center">
        <div className="text-5xl">💜</div>

        <h2 className="mt-4 text-5xl font-black text-purple-500">
          {sr}
        </h2>

        <p className="mt-2 font-bold text-zinc-500">
          Flores SR
        </p>
      </div>
    </div>
  )
}