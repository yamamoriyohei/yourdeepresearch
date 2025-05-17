import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { withAuthAndErrorHandling } from "@/lib/api-utils";
import { getUserResearchSessions } from "@/lib/research-utils";

/**
 * リサーチ履歴を取得するハンドラー
 * @param req リクエスト
 * @param userId 認証済みユーザーID
 * @returns リサーチセッションの配列
 */
async function getResearchHistory(req: NextRequest, userId: string) {
  console.log("API: getResearchHistory called with userId:", userId);

  // ユーザーのリサーチセッション一覧を取得
  try {
    const sessions = await getUserResearchSessions(userId);
    console.log("API: Retrieved sessions:", sessions);
    return sessions;
  } catch (error) {
    console.error("API: Error retrieving sessions:", error);
    throw error;
  }
}

// 認証とエラーハンドリングを適用したエンドポイント
export const GET = withAuthAndErrorHandling(getAuthenticatedUserId, getResearchHistory);
