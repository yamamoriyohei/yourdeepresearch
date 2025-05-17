import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getResearchSessionById } from "@/lib/supabaseCRUD";

interface Source {
  url: string;
  title: string;
}

interface ResearchResult {
  id: string;
  query: string;
  summary: string;
  details: string;
  sources: Source[];
  relatedTopics: string[];
  createdAt: string;
  status: "processing" | "completed" | "failed";
}

// Supabaseからリサーチ結果を取得する関数
async function getResearchResult(id: string): Promise<ResearchResult> {
  try {
    // Supabaseからデータを取得
    const session = await getResearchSessionById(id);

    if (!session) {
      throw new Error(`リサーチセッションID: ${id} が見つかりませんでした`);
    }

    // セッションのステータスを確認
    const sessionObj = session as { status?: string; query?: string; created_at?: string };
    const status = sessionObj.status || "processing";

    // 処理中の場合はその情報を返す
    if (status === "processing") {
      return {
        id,
        query: sessionObj.query || "unknown query",
        summary: "",
        details: "",
        sources: [],
        relatedTopics: [],
        createdAt: (sessionObj as any).created_at || new Date().toISOString(),
        status: "processing" as const,
      };
    }

    // 失敗した場合はエラー情報を返す
    if (status === "failed") {
      return {
        id,
        query: sessionObj.query || "unknown query",
        summary: "リサーチに失敗しました",
        details: "リサーチの実行中にエラーが発生しました。しばらく経ってから再度お試しください。",
        sources: [],
        relatedTopics: [],
        createdAt: (sessionObj as any).created_at || new Date().toISOString(),
        status: "failed" as const,
      };
    }

    // モックの結果を返す
    const result = {
      summary: "モックの要約",
      details: "モックの詳細",
      sources: [],
      related_topics: [],
    };
    const sources: Source[] = [];

    return {
      id,
      query: sessionObj.query || "unknown query",
      summary: result.summary,
      details: result.details,
      sources: sources.map((source: any) => ({
        url: source.url,
        title: source.title || source.url,
      })),
      relatedTopics: Array.isArray(result.related_topics)
        ? result.related_topics
        : typeof result.related_topics === "string"
          ? JSON.parse(result.related_topics)
          : [],
      createdAt: (result as any).created_at || new Date().toISOString(),
      status: status === "completed" ? ("completed" as const) : ("processing" as const),
    };
  } catch (error) {
    console.error("Error fetching research result:", error);

    // エラー時はフォールバックデータを返す
    return {
      id,
      query: "リサーチデータの取得に失敗しました",
      summary: "データの取得中にエラーが発生しました。しばらく経ってから再度お試しください。",
      details: `エラー詳細: ${error}`,
      sources: [],
      relatedTopics: [],
      createdAt: new Date().toISOString(),
      status: "failed" as const,
    };
  }
}

import ResearchResultClient from "@/components/ResearchResultClient";

export default async function ResearchResultPage({ params }: { params: { id: string } }) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getResearchResult(params.id);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/research" className="text-blue-600 hover:underline">
          ← 新しいリサーチに戻る
        </Link>
      </div>

      <ResearchResultClient
        id={params.id}
        query={result.query}
        summary={result.summary}
        details={result.details}
        sources={result.sources || []}
        relatedTopics={result.relatedTopics || []}
        createdAt={result.createdAt}
        status={result.status}
      />
    </div>
  );
}
