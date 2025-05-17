import { upsertResearchData, searchSimilarResearch } from "@/lib/pineconeCRUD";
import { pinecone, pineconeIndexName } from "@/lib/pineconeClient";

// OpenAIのgetEmbedding関数をモック
jest.mock("@/lib/openai", () => ({
  getEmbedding: jest.fn().mockResolvedValue(Array(1536).fill(0.1)),
}));

// jest.setup.jsで定義されたPineconeのモックを使用する

describe("PineconeCRUD Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // コンソール出力をモック
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("upsertResearchData", () => {
    test("should upsert data to Pinecone index", async () => {
      const id = "test-id";
      const textToEmbed = "This is a test text to embed into Pinecone";
      const metadata = {
        userId: "user-123",
        topic: "Test Topic",
        originalText: textToEmbed,
        createdAt: "2023-01-01T00:00:00Z",
      };

      await upsertResearchData(id, textToEmbed, metadata);

      // Pineconeクライアントが正しく呼ばれたか確認
      expect(pinecone.index).toHaveBeenCalledWith(pineconeIndexName);

      // upsertが正しいパラメータで呼ばれたか確認
      const mockIndex = pinecone.index();
      expect(mockIndex.upsert).toHaveBeenCalledWith([
        expect.objectContaining({
          id,
          values: expect.any(Array),
          metadata: expect.objectContaining({
            ...metadata,
            textPreview: expect.any(String),
          }),
        }),
      ]);

      // コンソールログが出力されたか確認
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`Successfully upserted research data with id: ${id}`)
      );
    });

    test("should handle errors gracefully when upserting data", async () => {
      // インデックスのupsertでエラーをシミュレート
      const mockError = new Error("Pinecone upsert error");
      const mockIndex = pinecone.index();
      mockIndex.upsert.mockRejectedValueOnce(mockError);

      const id = "test-id";
      const textToEmbed = "This is a test text";
      const metadata = {
        userId: "user-123",
        topic: "Test Topic",
        originalText: textToEmbed,
        createdAt: "2023-01-01T00:00:00Z",
      };

      await upsertResearchData(id, textToEmbed, metadata);

      // エラーが記録されたか確認
      expect(console.error).toHaveBeenCalledWith("Error upserting data to Pinecone:", mockError);
    });

    test("should handle missing Pinecone client", async () => {
      // Pineconeクライアントが未初期化の状態をシミュレート
      jest.resetModules();
      jest.mock("@/lib/pineconeClient", () => ({
        pinecone: null,
        pineconeIndexName: "test-index",
      }));

      // 関数を再インポート
      const { upsertResearchData } = require("@/lib/pineconeCRUD");

      const id = "test-id";
      const textToEmbed = "This is a test text";
      const metadata = {
        userId: "user-123",
        topic: "Test Topic",
        originalText: textToEmbed,
        createdAt: "2023-01-01T00:00:00Z",
      };

      await upsertResearchData(id, textToEmbed, metadata);

      // エラーが記録されたか確認
      expect(console.error).toHaveBeenCalledWith(
        "Pinecone client is not initialized. Cannot upsert data."
      );
    });
  });

  describe("searchSimilarResearch", () => {
    test("should search for similar research in Pinecone", async () => {
      const queryText = "Search query text";
      const userId = "mock-user-id";
      const topK = 5;

      const results = await searchSimilarResearch(queryText, userId, topK);

      // Pineconeクライアントが正しく呼ばれたか確認
      expect(pinecone.index).toHaveBeenCalledWith(pineconeIndexName);

      // queryが正しいパラメータで呼ばれたか確認
      const mockIndex = pinecone.index();
      expect(mockIndex.query).toHaveBeenCalledWith({
        vector: expect.any(Array),
        topK,
        includeMetadata: true,
        filter: { userId: { $eq: userId } },
      });

      // 正しい結果が返されたか確認
      expect(results).toHaveLength(1);
      expect(results![0]).toEqual({
        id: "mock-vector-id",
        score: 0.95,
        metadata: expect.objectContaining({
          text: "Mock vector text",
        }),
      });
    });

    test("should handle errors gracefully when searching data", async () => {
      // インデックスのqueryでエラーをシミュレート
      const mockError = new Error("Pinecone query error");
      const mockIndex = pinecone.index();
      mockIndex.query.mockRejectedValueOnce(mockError);

      const queryText = "Search query text";
      const userId = "mock-user-id";

      const results = await searchSimilarResearch(queryText, userId);

      // nullが返されたか確認
      expect(results).toBeNull();

      // エラーが記録されたか確認
      expect(console.error).toHaveBeenCalledWith("Error searching data in Pinecone:", mockError);
    });

    test("should handle missing Pinecone client when searching", async () => {
      // Pineconeクライアントが未初期化の状態をシミュレート
      jest.resetModules();
      jest.mock("@/lib/pineconeClient", () => ({
        pinecone: null,
        pineconeIndexName: "test-index",
      }));

      // 関数を再インポート
      const { searchSimilarResearch } = require("@/lib/pineconeCRUD");

      const queryText = "Search query text";
      const userId = "mock-user-id";

      const results = await searchSimilarResearch(queryText, userId);

      // nullが返されたか確認
      expect(results).toBeNull();

      // エラーが記録されたか確認
      expect(console.error).toHaveBeenCalledWith(
        "Pinecone client is not initialized. Cannot search data."
      );
    });
  });

  // getEmbeddingForPinecone関数のテスト（内部関数なのでインポートできないため、間接的にテスト）
  describe("getEmbeddingForPinecone", () => {
    test("should handle errors from OpenAI embedding API", async () => {
      // OpenAIのgetEmbedding関数がエラーを投げるようにモックを一時的に上書き
      const { getEmbedding } = require("@/lib/openai");
      const originalGetEmbedding = getEmbedding;
      require("@/lib/openai").getEmbedding = jest
        .fn()
        .mockRejectedValue(new Error("OpenAI API error"));

      const id = "test-id";
      const textToEmbed = "This is a test text";
      const metadata = {
        userId: "user-123",
        topic: "Test Topic",
        originalText: textToEmbed,
        createdAt: "2023-01-01T00:00:00Z",
      };

      try {
        // upsertResearchDataを実行（内部でgetEmbeddingForPineconeが呼ばれる）
        await upsertResearchData(id, textToEmbed, metadata);

        // upsertが呼ばれたか確認
        const mockIndex = pinecone.index();
        expect(mockIndex.upsert).toHaveBeenCalled();

        // 警告が記録されたか確認
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Falling back to mock embedding for text")
        );
      } finally {
        // モックを元に戻す
        require("@/lib/openai").getEmbedding = originalGetEmbedding;
      }
    });
  });
});
