import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { withAuthAndErrorHandling } from "@/lib/api-utils";
import { getCompleteResearchResult, getResearchSession } from "@/lib/research-utils";

/**
 * リサーチステータスを取得するハンドラー
 * @param req リクエスト
 * @param userId 認証済みユーザーID
 * @returns リサーチステータス情報
 */
async function getResearchStatus(req: NextRequest, userId: string) {
  // URLからセッションIDを取得
  const id = req.url.split('/').pop()?.split('?')[0];
  
  if (!id) {
    const error = new Error("リサーチIDが必要です");
    (error as any).code = "VALIDATION_ERROR";
    throw error;
  }
  
  // セッションを取得
  const session = await getResearchSession(id);
  
  // セッションの所有者を確認
  if (session.user_id !== userId) {
    const error = new Error("このリサーチにアクセスする権限がありません");
    (error as any).code = "FORBIDDEN";
    (error as any).status = 403;
    throw error;
  }
  
  // ステータスに応じた情報を返す
  if (session.status === "processing") {
    return {
      id,
      status: "processing",
      progress: 50, // 実際の進捗状況を取得するロジックが必要
      message: "リサーチを実行中です",
    };
  } else if (session.status === "completed") {
    // 完了している場合は結果も含めて返す
    const completeResult = await getCompleteResearchResult(id);
    
    return {
      id,
      status: "completed",
      progress: 100,
      result: {
        summary: completeResult.result?.summary || "",
        details: completeResult.result?.details || "",
        sources: completeResult.sources || [],
        relatedTopics: completeResult.result?.related_topics || [],
      },
    };
  } else {
    // 失敗した場合
    return {
      id,
      status: "failed",
      progress: 100,
      error: "リサーチの実行中にエラーが発生しました",
    };
  }
}

// 認証とエラーハンドリングを適用したエンドポイント
export const GET = withAuthAndErrorHandling(getAuthenticatedUserId, getResearchStatus);
