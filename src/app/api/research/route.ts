import { NextRequest } from "next/server";
import { performResearch } from "@/lib/openDeepResearch";
import { getAuthenticatedUserId } from "@/lib/auth";
import { withAuthAndErrorHandling } from "@/lib/api-utils";
import { createJob, executeJob } from "@/lib/jobQueue";
import {
  createResearchSession,
  updateResearchSession,
  saveResearchResult,
  saveSources
} from "@/lib/research-utils";

/**
 * リサーチを作成するハンドラー
 * @param req リクエスト
 * @param userId 認証済みユーザーID
 * @returns 作成されたリサーチセッションの情報
 */
async function createResearch(req: NextRequest, userId: string) {
  console.log("API: createResearch called with userId:", userId);

  // リクエストボディを取得
  const body = await req.json();
  const { query, maxDepth, includeSourceLinks } = body;

  console.log("API: Request body:", { query, maxDepth, includeSourceLinks });

  // リクエストボディを検証
  if (!query) {
    const error = new Error("クエリが必要です");
    (error as any).code = "VALIDATION_ERROR";
    throw error;
  }

  // リサーチセッションを作成
  const session = await createResearchSession({
    user_id: userId,
    query,
    status: "processing",
    created_at: new Date().toISOString(),
  });

  // バックグラウンドジョブを作成
  const jobId = `research_${session.id}`;
  createJob(jobId);

  // 非同期でリサーチを実行
  executeJob(jobId, async (updateProgress) => {
    try {
      // 進捗状況を更新
      updateProgress(10, "リサーチを開始しています...");

      // リサーチを実行
      const result = await performResearch({
        query,
        userId,
        maxDepth: maxDepth || 3,
        includeSourceLinks: includeSourceLinks !== false,
        updateProgress,
      });

      // 進捗状況を更新
      updateProgress(90, "結果を保存しています...");

      // リサーチ結果を保存
      const savedResult = await saveResearchResult({
        session_id: session.id,
        summary: result.summary,
        details: result.details,
        related_topics: Array.isArray(result.relatedTopics)
          ? result.relatedTopics
          : [],
        created_at: new Date().toISOString(),
      });

      // ソースを保存
      if (result.sources && result.sources.length > 0) {
        const sourcesToSave = result.sources.map((source: any) => ({
          research_result_id: savedResult.id,
          url: source.url || source,
          title: source.title || source.url || source,
          created_at: new Date().toISOString(),
        }));

        await saveSources(sourcesToSave);
      }

      // セッションのステータスを更新
      await updateResearchSession(session.id, {
        status: "completed",
        updated_at: new Date().toISOString(),
      });

      // 完了
      updateProgress(100, "リサーチが完了しました");
    } catch (error: any) {
      console.error("Research job error:", error);

      // エラー時はセッションのステータスを更新
      await updateResearchSession(session.id, {
        status: "failed",
        updated_at: new Date().toISOString(),
      });

      // エラー情報を更新
      updateProgress(100, `エラーが発生しました: ${error.message}`);
    }
  }).catch((error) => {
    console.error("Job execution error:", error);
  });

  const response = {
    id: session.id,
    message: "リサーチが開始されました",
  };

  console.log("API: Returning response:", response);
  return response;
}

// 認証とエラーハンドリングを適用したエンドポイント
export const POST = withAuthAndErrorHandling(getAuthenticatedUserId, createResearch);