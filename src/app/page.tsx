import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Deep Research Agent</h1>
        <p className="text-xl mb-8">AIを活用した高度なリサーチエージェント</p>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            サインイン
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}
