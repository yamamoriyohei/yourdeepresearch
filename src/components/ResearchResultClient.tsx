"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResearchProgress from "./ResearchProgress";
import { useRouter } from "next/navigation";

interface Source {
  url: string;
  title: string;
}

interface ResearchResultProps {
  id: string;
  query: string;
  summary: string;
  details: string;
  sources: Source[];
  relatedTopics: string[];
  createdAt: string;
  status: "processing" | "completed" | "failed";
}

export default function ResearchResultClient({
  id,
  query,
  summary,
  details,
  sources,
  relatedTopics,
  createdAt,
  status,
}: ResearchResultProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("summary");
  const formattedDate = new Date(createdAt).toLocaleString("ja-JP");

  // 処理が完了したらページをリロード
  const handleResearchComplete = () => {
    router.refresh();
  };

  // 処理中の場合は進行状況を表示
  if (status === "processing") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>リサーチ進行中: {query}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchProgress sessionId={id} onComplete={handleResearchComplete} />
        </CardContent>
      </Card>
    );
  }

  // エラーの場合はエラーメッセージを表示
  if (status === "failed") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>リサーチに失敗しました</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-100 text-red-800 rounded-md mb-4">
            <p className="font-semibold">エラーが発生しました</p>
            <p>{summary}</p>
            <p className="mt-2">{details}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push("/research")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新しいリサーチを開始
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="break-words">{query}</CardTitle>
            <p className="text-sm text-gray-500">作成日時: {formattedDate}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full flex-wrap">
              <TabsTrigger value="summary" className="flex-1">
                要約
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                詳細
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex-1">
                ソース ({sources.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="prose max-w-none">
                <p>{summary}</p>
              </div>

              {relatedTopics.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">関連トピック</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details">
              <div className="prose max-w-none whitespace-pre-line">{details}</div>
            </TabsContent>

            <TabsContent value="sources">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">参考ソース</h3>
                {sources.length > 0 ? (
                  <ul className="space-y-2">
                    {sources.map((source, index) => (
                      <li key={index} className="border-b pb-2 break-words">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title || source.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>このリサーチにはソースがありません。</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 order-2 sm:order-1"
        >
          ダッシュボードに戻る
        </button>
        <button
          onClick={() => router.push("/research")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 order-1 sm:order-2"
        >
          新しいリサーチを開始
        </button>
      </div>
    </div>
  );
}
