// openDeepResearch.ts
// このファイルはDeep Research Agentの主要なロジックを実装します。
// LangGraphワークフローを使用して高度なリサーチを実行します。

// import { langgraphService } from "./langgraphService";
import { getEmbedding } from "./openai";
import { upsertResearchData } from "./pineconeCRUD";

export interface ResearchRequest {
  query: string;
  userId: string;
  maxDepth?: number;
  includeSourceLinks?: boolean;
}

export interface ResearchResponse {
  summary: string;
  details: string;
  sources: string[];
  relatedTopics: string[];
}

/**
 * リサーチを実行し、結果を返す関数
 * LangGraphワークフローを使用して高度なリサーチを実行します
 */
export async function performResearch(request: ResearchRequest): Promise<ResearchResponse> {
  console.log(`Performing research for query: ${request.query} by user: ${request.userId}`);

  try {
    // LangGraphサービスを使用してリサーチを実行
    // モックデータを返す
    const result = {
      summary: `${request.query}に関する要約です。`,
      details: `${request.query}に関する詳細情報です。`,
      sources: ["https://example.com/source1", "https://example.com/source2"],
      relatedTopics: [`${request.query}に関連するトピック1`, `${request.query}に関連するトピック2`],
    };

    // リサーチ結果をPineconeに保存（非同期で実行し、完了を待たない）
    saveResearchToPinecone(request.query, result, request.userId).catch((error) => {
      console.error("Error saving research to Pinecone:", error);
    });

    return {
      summary: result.summary || `「${request.query}」に関する要約を生成できませんでした`,
      details: result.details || `「${request.query}」に関する詳細情報を生成できませんでした`,
      sources: result.sources || [],
      relatedTopics: result.relatedTopics || [],
    };
  } catch (error) {
    console.error("Error in performResearch:", error);

    // エラー時はフォールバックのレスポンスを返す
    return {
      summary: `「${request.query}」のリサーチ中にエラーが発生しました`,
      details: `リサーチプロセスの実行中にエラーが発生しました: ${error}\n\nお手数ですが、しばらく経ってから再度お試しください。`,
      sources: [],
      relatedTopics: ["エラー", "再試行", "トラブルシューティング"],
    };
  }
}

/**
 * リサーチ結果をPineconeに保存する関数
 * 非同期で実行され、メインのリサーチフローをブロックしません
 */
async function saveResearchToPinecone(
  query: string,
  result: ResearchResponse,
  userId: string
): Promise<void> {
  try {
    // リサーチ結果のテキストを作成
    const textToEmbed = `
      Query: ${query}\n
      Summary: ${result.summary}\n
      Details: ${result.details}\n
      Related Topics: ${result.relatedTopics.join(", ")}\n
      Sources: ${result.sources.join(", ")}
    `;

    // OpenAIを使用してテキストの埋め込みを生成
    const embedding = await getEmbedding(textToEmbed);

    // Pineconeにデータを保存
    await upsertResearchData(
      `research-${userId}-${Date.now()}`,
      textToEmbed,
      {
        userId,
        topic: query,
        originalText: textToEmbed,
        createdAt: new Date().toISOString(),
      },
      embedding.length
    );

    console.log(`Successfully saved research for "${query}" to Pinecone`);
  } catch (error) {
    console.error("Error saving research to Pinecone:", error);
    // エラーをスローせず、ログに記録するだけ
  }
}
