"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ResearchForm from "@/components/ResearchForm";

export default function ResearchPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // リサーチ完了時のハンドラー
  const handleResearchSuccess = (resultId: string) => {
    router.push(`/research/${resultId}`);
  };

  if (!isLoaded) {
    return <div className="text-center p-8">ユーザー情報を読み込み中...</div>;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
        <p>この機能を利用するにはログインしてください。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">新しいリサーチを開始</h1>

      <div className="mb-8">
        <ResearchForm onSuccess={handleResearchSuccess} />
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">リサーチのヒント</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>具体的な質問や調査したいトピックを明確に記述してください</li>
          <li>複雑なトピックは複数の小さな質問に分けると良い結果が得られます</li>
          <li>時事的な内容や最新の情報を求める場合は、その旨を明記してください</li>
          <li>特定の視点や観点からの情報が必要な場合は、それを指定してください</li>
        </ul>
      </div>
    </div>
  );
}
