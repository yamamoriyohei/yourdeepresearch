"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProgressStatus } from "@/types";

/**
 * リサーチの進捗状況を取得し、ポーリングするためのカスタムフック
 * @param sessionId リサーチセッションID
 * @param onComplete 完了時のコールバック関数
 * @param enabled クエリを有効にするかどうか
 * @returns クエリの結果（進捗状況）
 */
export function useResearchStatus(
  sessionId: string | null,
  onComplete?: (result: any) => void,
  enabled: boolean = true
) {
  // React Queryを使用してリサーチのステータスを取得
  const query = useQuery<ProgressStatus, Error, ProgressStatus>({
    queryKey: ["researchStatus", sessionId],
    queryFn: async (): Promise<ProgressStatus> => {
      if (!sessionId) {
        return {
          status: "idle",
          progress: 0,
          message: "リサーチセッションが開始されていません",
        };
      }

      const response = await fetch(`/api/research/status?sessionId=${sessionId}`, {
        credentials: 'include', // 認証情報を含める
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error fetching research status:", errorData);
        throw new Error(`エラーが発生しました: ${errorData?.error?.message || "進捗状況の取得に失敗しました"}`);

      }

      const responseData = await response.json();

      // 新しいレスポンス形式（success/data）に対応
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        return responseData;
      }
    },
    // 2秒ごとにポーリング (処理中のみ)
    refetchInterval: (query) => {
      return query.state.data?.status === "processing" ? 2000 : false;
    },
    // 背景でのポーリングを有効化
    refetchIntervalInBackground: true,
    // セッションIDがないか、enabledがfalseの場合は無効化
    enabled: !!sessionId && enabled,
    // キャッシュ時間を30秒に設定
    staleTime: 30 * 1000,
  });

  // 完了時の処理
  useEffect(() => {
    if (query.data?.status === "completed" && onComplete && query.data.result) {
      onComplete(query.data.result);
    }
  }, [query.data, onComplete]);

  return query;
}
