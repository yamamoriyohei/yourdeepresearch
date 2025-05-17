"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearchHistory } from "@/lib/hooks/useResearchHistory";
import { ResearchSession } from "@/types";

// 履歴アイテムをメモ化したコンポーネント
const ResearchHistoryItem = memo(function ResearchHistoryItem({
  session,
  onView,
}: {
  session: ResearchSession;
  onView: (id: string) => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">完了</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">処理中</Badge>;
      case "failed":
        return <Badge className="bg-red-500">失敗</Badge>;
      default:
        return <Badge className="bg-gray-500">不明</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors">
      <div className="space-y-2 mb-3 sm:mb-0 flex-1 min-w-0">
        <div className="font-medium truncate">{session.query}</div>
        <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
          <span className="whitespace-nowrap">{formatDate(session.created_at)}</span>
          {getStatusBadge(session.status)}
        </div>
      </div>
      <Button
        onClick={() => onView(session.id)}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        詳細を見る
      </Button>
    </div>
  );
});

// エラー表示コンポーネント
const ErrorDisplay = memo(function ErrorDisplay({
  error,
  onRefresh,
}: {
  error: Error;
  onRefresh: () => void;
}) {
  return (
    <div className="p-4 bg-red-100 text-red-800 rounded-md">
      <p>エラーが発生しました: {error.message}</p>
      <Button onClick={onRefresh} className="mt-2" variant="outline">
        再読み込み
      </Button>
    </div>
  );
});

// スケルトンローディングコンポーネント
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-md">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      ))}
    </div>
  );
});

// 空の履歴表示コンポーネント
const EmptyHistory = memo(function EmptyHistory({ onNewResearch }: { onNewResearch: () => void }) {
  return (
    <div className="text-center p-4 text-gray-500">
      <p>リサーチ履歴がありません</p>
      <Button onClick={onNewResearch} className="mt-4">
        新しいリサーチを開始
      </Button>
    </div>
  );
});

export default function ResearchHistory() {
  const router = useRouter();
  // React Queryフックを使用して履歴データを取得
  const { data: sessions = [], isLoading, error, refetch } = useResearchHistory();

  const handleViewResult = (id: string) => {
    router.push(`/research/${id}`);
  };

  const handleNewResearch = () => {
    router.push("/research");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>リサーチ履歴</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorDisplay error={error} onRefresh={() => refetch()} />
        ) : sessions.length === 0 ? (
          <EmptyHistory onNewResearch={handleNewResearch} />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <ResearchHistoryItem key={session.id} session={session} onView={handleViewResult} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
