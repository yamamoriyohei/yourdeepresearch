import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResearchHistory from "@/components/ResearchHistory";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">クイックリンク</h2>
          <div className="space-y-2">
            <Link
              href="/research"
              className="block p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
            >
              新しいリサーチを開始
            </Link>
            <Link
              href="/profile"
              className="block p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-center"
            >
              プロフィール設定
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">ユーザー名:</span> {user.firstName} {user.lastName}
            </p>
            <p>
              <span className="font-medium">メールアドレス:</span>{" "}
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <ResearchHistory />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">ヘルプとサポート</h2>
        <p className="mb-4">
          Deep Research Agentの使い方についての質問やフィードバックがありますか？
        </p>
        <a
          href="mailto:support@example.com"
          className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          サポートに問い合わせる
        </a>
      </div>
    </div>
  );
}
