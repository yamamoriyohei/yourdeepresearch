import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResearchSessionById } from "@/lib/supabaseCRUD";
import { getJob } from "@/lib/jobQueue";

export async function GET(req: NextRequest) {
  try {
    // ユーザー認証を確認
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // URLからセッションIDを取得
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "セッションIDが必要です" }, { status: 400 });
    }

    // セッション情報を取得
    const session = await getResearchSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    }

    // セッションがこのユーザーのものか確認
    const sessionObj = session as { user_id?: string };
    if (sessionObj.user_id && sessionObj.user_id !== userId) {
      return NextResponse.json(
        { error: "このセッションにアクセスする権限がありません" },
        { status: 403 }
      );
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
  } catch (error: any) {
    console.error("Research status API error:", error);

    return NextResponse.json(
      { error: `進捗状況の取得中にエラーが発生しました: ${error.message}` },
      { status: 500 }
    );
  }
}
