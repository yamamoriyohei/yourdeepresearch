"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InfoCard } from "@/components/ui/info-card";
import ResearchProgress from "./ResearchProgress";
import { ResearchRequest } from "@/types";

interface ResearchFormProps {
  onSuccess?: (resultId: string) => void;
}

export default function ResearchForm({ onSuccess }: ResearchFormProps) {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError("リサーチトピックを入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSessionId(null);

      // リクエストボディの作成
      const researchRequest: ResearchRequest = {
        query: topic,
        maxDepth: 3,
        includeSourceLinks: true,
      };

      console.log("Sending research request:", researchRequest);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(researchRequest),
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || errorData.error || "リサーチの実行中にエラーが発生しました"
        );
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      // 新しいレスポンス形式（success/data）に対応
      const data = responseData.success ? responseData.data : responseData;
      console.log("Processed data:", data);

      if (!data || !data.id) {
        console.error("Invalid response format:", responseData);
        throw new Error("サーバーからの応答が無効です");
      }

      setSessionId(data.id);

      // 注: ここではリダイレクトせず、進捗状況を表示する
    } catch (err: any) {
      setError(err.message || "リサーチの実行中にエラーが発生しました");
      setIsLoading(false);
    }
  };

  // リサーチが完了したときの処理
  const handleResearchComplete = (result: any) => {
    setIsLoading(false);

    // 成功コールバックがあれば呼び出す
    if (onSuccess && sessionId) {
      onSuccess(sessionId);
    } else if (sessionId) {
      // なければ結果ページにリダイレクト
      router.push(`/research/${sessionId}`);
    }
  };

  // フォーム内容を表示
  const renderFormContent = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
          リサーチトピック
        </label>
        <Textarea
          id="topic"
          rows={4}
          placeholder="調査したいトピックを入力してください..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
          className="w-full min-h-[120px] md:min-h-[150px]"
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <Button
        type="submit"
        className="w-full py-6 md:py-4 text-base md:text-lg"
        disabled={isLoading}
      >
        {isLoading ? "リサーチを準備中..." : "リサーチを開始"}
      </Button>
    </form>
  );

  // リサーチのヒント
  const researchTips = (
    <>
      <h3 className="text-sm font-semibold mb-2">リサーチのヒント</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
        <li>具体的な質問や調査したいトピックを明確に記述してください</li>
        <li>複雑なトピックは複数の小さな質問に分けると良い結果が得られます</li>
        <li>時事的な内容や最新の情報を求める場合は、その旨を明記してください</li>
      </ul>
    </>
  );

  return (
    <InfoCard title="新しいリサーチを開始" footer={researchTips}>
      {!sessionId ? (
        renderFormContent()
      ) : (
        <ResearchProgress sessionId={sessionId} onComplete={handleResearchComplete} />
      )}
    </InfoCard>
  );
}
