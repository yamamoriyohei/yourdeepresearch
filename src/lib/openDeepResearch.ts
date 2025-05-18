// openDeepResearch.ts
// このファイルはDeep Research Agentの主要なロジックを実装します。
// LangGraphワークフローを使用して高度なリサーチを実行します。

// import { langgraphService } from "./langgraphService";
import { getEmbedding, generateWithOpenAI } from "./openai";
import { searchWithTavily } from "./tavily";
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
    // 1. Tavilyを使用してウェブ検索を実行
    const { query, maxDepth = 3, includeSourceLinks = true } = request;
    console.log(`Searching web for: ${query} with maxDepth: ${maxDepth}`);

    const searchResults = await searchWithTavily(query, maxDepth * 2);

    if (!searchResults || searchResults.length === 0) {
      throw new Error("ウェブ検索結果が見つかりませんでした");
    }

    console.log(`Found ${searchResults.length} search results`);

    // 2. 検索結果からコンテンツを抽出
    const searchContent = searchResults
      .map((result, index) => `[${index + 1}] ${result.title}\n${result.content}\n${result.url}`)
      .join("\n\n");

    // 3. OpenAIを使用して要約を生成
    const summaryPrompt = `
      以下の検索結果に基づいて、「${query}」に関する包括的な要約を作成してください。
      要約は簡潔で明確、かつ情報量が豊富であるべきです。

      検索結果:
      ${searchContent}

      要約:
    `;

    console.log("Generating summary with OpenAI...");
    const summary = await generateWithOpenAI(summaryPrompt, "gpt-4") ||
      `「${query}」に関する要約を生成できませんでした`;

    // 4. 詳細情報を生成
    const detailsPrompt = `
      以下の検索結果に基づいて、「${query}」に関する詳細な情報を提供してください。
      情報は構造化され、読みやすく、事実に基づいているべきです。
      可能であれば、セクションに分けて情報を整理してください。

      検索結果:
      ${searchContent}

      詳細情報:
    `;

    console.log("Generating detailed information with OpenAI...");
    const details = await generateWithOpenAI(detailsPrompt, "gpt-4") ||
      `「${query}」に関する詳細情報を生成できませんでした`;

    // 5. 関連トピックを生成
    const relatedTopicsPrompt = `
      以下の検索結果に基づいて、「${query}」に関連する5つのトピックを提案してください。
      各トピックは簡潔な単語やフレーズで、さらなる調査に役立つものであるべきです。

      検索結果:
      ${searchContent}

      関連トピック（カンマ区切りのリストで提供してください）:
    `;

    console.log("Generating related topics with OpenAI...");
    const relatedTopicsText = await generateWithOpenAI(relatedTopicsPrompt, "gpt-3.5-turbo") || "";
    const relatedTopics = relatedTopicsText
      .split(",")
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);

    // 6. ソースを準備
    const sources = includeSourceLinks
      ? searchResults.map(result => ({ url: result.url, title: result.title }))
      : [];

    const result = {
      summary,
      details,
      sources: sources.map(s => s.url),
      relatedTopics,
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
