export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2]">
      <div className="text-center">
        <div className="animate-bounce text-8xl">
          🌸
        </div>

        <h2 className="mt-6 text-4xl font-black text-pink-500">
          Carregando jardim...
        </h2>

        <p className="mt-3 text-lg text-zinc-500">
          Conectando ao Notion ✨
        </p>
      </div>
    </main>
  )
}