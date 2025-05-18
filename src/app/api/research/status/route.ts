import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { withAuthAndErrorHandling } from "@/lib/api-utils";
import { getResearchSessionById } from "@/lib/supabaseCRUD";
import { getJob } from "@/lib/jobQueue";

/**
 * リサーチの進捗状況を取得するハンドラー
 * @param req リクエスト
 * @param userId 認証済みユーザーID
 * @returns 進捗状況
 */
async function getResearchStatus(req: NextRequest, userId: string) {

    // URLからセッションIDを取得
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      const error = new Error("セッションIDが必要です");
      (error as any).code = "VALIDATION_ERROR";
      throw error;
    }

    // セッション情報を取得
    const session = await getResearchSessionById(sessionId);

    if (!session) {
      const error = new Error("セッションが見つかりません");
      (error as any).code = "NOT_FOUND";
      throw error;
    }

    // セッションがこのユーザーのものか確認
    const sessionObj = session as { user_id?: string };
    if (sessionObj.user_id && sessionObj.user_id !== userId) {
      const error = new Error("このセッションにアクセスする権限がありません");
      (error as any).code = "FORBIDDEN";
      throw error;
    }

    // ジョブキューから進捗状況を取得
    const job = getJob(sessionId);

    // 進捗状況を設定
    let progress = 0;
    let message = "";
    let status = "processing";

    // ジョブが存在する場合は、その進捗状況を使用
    if (job) {
      progress = job.progress;
      message = job.message;

      // ジョブのステータスが完了または失敗の場合、セッションのステータスも更新されているはず
      if (job.status === "completed" || job.status === "failed") {
        status = job.status === "completed" ? "completed" : "failed";
      }
    } else {
      // ジョブが存在しない場合は、セッションのステータスに基づいて進捗状況を設定
      switch (status) {
        case "processing":
          // 処理中の場合、進捗状況を推定
          progress = 50;
          message = "リサーチを実行中...";

          break;

        case "completed":
          progress = 100;
          message = "リサーチが完了しました";
          break;

        case "failed":
          progress = 0;
          message = "リサーチに失敗しました";
          break;

        default:
          progress = 0;
          message = "不明な状態です";
      }
    }

    // 結果を返す
    return NextResponse.json({
      status,
      progress,
      message,
      // 完了している場合は結果も返す
      result:
        status === "completed"
          ? {
              id: "mock-result-id",
              query: "mock-query",
              summary: "モックの要約",
              details: "モックの詳細",
              sources: [],
              relatedTopics: [],
            }
          : null,
    });
}

// 認証とエラーハンドリングを適用したエンドポイント
export const GET = withAuthAndErrorHandling(getAuthenticatedUserId, getResearchStatus);
