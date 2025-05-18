"use client";

import { useQuery } from "@tanstack/react-query";
import { ResearchSession } from "@/types";

/**
 * ユーザーのリサーチ履歴を取得するためのカスタムフック
 * @param limit 取得する履歴の最大数
 * @returns クエリの結果（リサーチ履歴）
 */
export function useResearchHistory(limit?: number) {
  return useQuery<ResearchSession[], Error>({
    queryKey: ["researchHistory", limit],
    queryFn: async (): Promise<ResearchSession[]> => {
      const url = new URL("/api/research/history", window.location.origin);

      if (limit) {
        url.searchParams.append("limit", limit.toString());
      }

      console.log("Fetching research history from:", url.toString());

      try {
        const response = await fetch(url.toString());
        console.log("Research history response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Error response data:", errorData);
          throw new Error("履歴の取得に失敗しました");
        }

        const responseData = await response.json();
        console.log("Research history data:", responseData);

        // 新しいレスポンス形式（success/data）に対応
        if (responseData.success && Array.isArray(responseData.data)) {
          return responseData.data;
        } else if (Array.isArray(responseData)) {
          return responseData;
        } else {
          console.error("Unexpected response format:", responseData);
          return []; // 空の配列を返す
        }
      } catch (error) {
        console.error("Error fetching research history:", error);
        throw error;
      }
    },
    // 5分間はキャッシュを使用
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 特定のリサーチセッションの詳細を取得するためのカスタムフック
 * @param sessionId リサーチセッションID
 * @returns クエリの結果（リサーチセッションの詳細）
 */
export function useResearchDetail(sessionId: string | null) {
  return useQuery<ResearchSession, Error>({
    queryKey: ["researchDetail", sessionId],
    queryFn: async (): Promise<ResearchSession> => {
      if (!sessionId) {
        throw new Error("セッションIDが指定されていません");
      }

      const response = await fetch(`/api/research/history/${sessionId}`);

      if (!response.ok) {
        throw new Error("リサーチ詳細の取得に失敗しました");
      }

      const responseData = await response.json();

      // 新しいレスポンス形式（success/data）に対応
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        return responseData;
      }
    },
    // セッションIDがない場合は無効化
    enabled: !!sessionId,
    // 10分間はキャッシュを使用
    staleTime: 10 * 60 * 1000,
  });
}
