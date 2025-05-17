// pineconeCRUD.ts
// This file will contain CRUD operations for Pinecone, specifically for RAG history.

import { pinecone, pineconeIndexName } from "./pineconeClient";
import { type Vector } from "@pinecone-database/pinecone";

// Interface for the metadata to be stored with each vector
export interface ResearchHistoryMetadata {
  userId: string; // To associate the history with a user
  topic: string;
  originalText: string; // The actual text content that was embedded
  sourceUrl?: string; // Optional: URL of the source document
  createdAt: string; // ISO string date
  // Add any other relevant metadata fields
  [key: string]: any; // インデックスシグネチャを追加
}

// Interface for the data to be upserted to Pinecone
// Pinecone's Vector type already includes id, values, and metadata (optional)
export interface PineconeResearchRecord extends Vector {
  metadata: ResearchHistoryMetadata;
}

// --- Pinecone CRUD Operations for Research History ---

/**
 * OpenAIの埋め込みモデルを使用してテキストをベクトルに変換します。
 * @param text 埋め込みを生成するテキスト
 * @param dimension 埋め込みの次元数（Pineconeインデックスの設定と一致する必要あり）
 * @returns 埋め込みベクトル
 */
async function getEmbeddingForPinecone(text: string, dimension: number = 1536): Promise<number[]> {
  try {
    // OpenAIの埋め込みモデルを使用
    const { getEmbedding } = await import("./openai");
    return await getEmbedding(text);
  } catch (error) {
    console.error("Error getting embedding from OpenAI:", error);

    // エラー時はフォールバックとしてモック埋め込みを生成
    console.warn(`Falling back to mock embedding for text: "${text.substring(0, 50)}..."`);
    const mockEmbedding = Array(dimension)
      .fill(0)
      .map(() => Math.random() * 0.1);
    return mockEmbedding;
  }
}

// Upsert research data into Pinecone
export async function upsertResearchData(
  id: string, // Unique ID for the record
  textToEmbed: string,
  metadata: ResearchHistoryMetadata,
  embeddingDimension: number = 1536 // Ensure this matches your Pinecone index dimension
): Promise<void> {
  if (!pinecone) {
    console.error("Pinecone client is not initialized. Cannot upsert data.");
    return;
  }

  try {
    // 新しい埋め込み関数を使用
    const embedding = await getEmbeddingForPinecone(textToEmbed, embeddingDimension);
    const index = pinecone.index<ResearchHistoryMetadata>(pineconeIndexName);

    // メタデータにテキストのプレビューを追加
    const enhancedMetadata = {
      ...metadata,
      textPreview: textToEmbed.slice(0, 1000), // 最初の1000文字をプレビューとして保存
    };

    const recordToUpsert: PineconeResearchRecord = {
      id: id,
      values: embedding,
      metadata: enhancedMetadata,
    };

    await index.upsert([recordToUpsert]);
    console.log(
      `Successfully upserted research data with id: ${id} to Pinecone index: ${pineconeIndexName}`
    );
  } catch (error) {
    console.error("Error upserting data to Pinecone:", error);
    // エラーはログに記録するが、プロセスは続行させる
  }
}

// Search for similar research history in Pinecone
export async function searchSimilarResearch(
  queryText: string,
  userId: string, // To potentially filter or prioritize user-specific history
  topK: number = 5,
  embeddingDimension: number = 1536 // Ensure this matches your Pinecone index dimension
): Promise<Array<{ id: string; score: number; metadata?: ResearchHistoryMetadata }> | null> {
  if (!pinecone) {
    console.error("Pinecone client is not initialized. Cannot search data.");
    return null;
  }

  try {
    // 新しい埋め込み関数を使用
    const queryEmbedding = await getEmbeddingForPinecone(queryText, embeddingDimension);
    const index = pinecone.index<ResearchHistoryMetadata>(pineconeIndexName);

    // ユーザーIDでフィルタリングするオプションを追加
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: { userId: { $eq: userId } }, // ユーザーのリサーチのみにフィルタリング
    });

    console.log(
      `Found ${queryResponse.matches.length} similar research items for user ${userId} in Pinecone.`
    );
    return queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score || 0, // 類似度スコア
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error("Error searching data in Pinecone:", error);
    return null;
  }
}

/*
Pinecone Index Setup Notes:

1.  Create a Pinecone account and an API key.
2.  Create an index in your Pinecone dashboard.
    -   **Index Name**: e.g., 'deep-research-history' (this should match `pineconeIndexName`)
    -   **Dimension**: This must match the dimension of the embeddings you'll be using (e.g., OpenAI's text-embedding-ada-002 uses 1536 dimensions).
    -   **Metric**: Choose a similarity metric (e.g., 'cosine', 'euclidean', 'dotproduct'). Cosine is common for text embeddings.
3.  Set the following environment variables in your Next.js application:
    -   `PINECONE_API_KEY`: Your Pinecone API key.
    -   `PINECONE_ENVIRONMENT`: Your Pinecone project's environment (e.g., 'gcp-starter', 'us-west1-gcp').
    -   `PINECONE_INDEX_NAME`: The name of your index (optional, defaults to 'deep-research-history' if not set).
    -   `OPENAI_API_KEY` (if using OpenAI for embeddings): Your OpenAI API key.

The `getEmbedding` function is a placeholder. You'll need to integrate a proper
embedding model service (like OpenAI, Cohere, Sentence Transformers, etc.) to convert
your research text into vector embeddings before storing them in Pinecone.
The dimension of these embeddings MUST match the dimension configured for your Pinecone index.
*/
