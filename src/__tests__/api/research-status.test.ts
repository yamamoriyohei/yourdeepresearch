import { NextRequest } from "next/server";
import { GET } from "@/app/api/research/status/route";

// モック
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "mock-user-id" })),
}));

jest.mock("@/lib/supabaseCRUD", () => ({
  getResearchSessionById: jest.fn(),
}));

jest.mock("@/lib/jobQueue", () => ({
  getJob: jest.fn(),
}));

describe("Research Status API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    // authモックを上書きして未認証状態をシミュレート
    require("@clerk/nextjs/server").auth.mockReturnValueOnce({ userId: null });

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("認証が必要です");
  });

  test("returns 400 when sessionId is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/research/status");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("セッションIDが必要です");
  });

  test("returns 404 when session is not found", async () => {
    // getResearchSessionByIdがnullを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionById.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("セッションが見つかりません");
  });

  test("returns 403 when session belongs to another user", async () => {
    // 別のユーザーのセッションを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionById.mockResolvedValueOnce({
      id: "test-id",
      user_id: "another-user-id",
    });

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("このセッションにアクセスする権限がありません");
  });

  test("returns job status from job queue when available", async () => {
    // セッションを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionById.mockResolvedValueOnce({
      id: "test-id",
      user_id: "mock-user-id",
      status: "processing",
    });

    // ジョブキューからジョブを返すようにモック
    require("@/lib/jobQueue").getJob.mockReturnValueOnce({
      status: "processing",
      progress: 75,
      message: "レポートを生成しています...",
    });

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("processing");
    expect(data.progress).toBe(75);
    expect(data.message).toBe("レポートを生成しています...");
  });

  test("calculates progress based on session when job is not available", async () => {
    // セッションを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionById.mockResolvedValueOnce({
      id: "test-id",
      user_id: "mock-user-id",
      status: "processing",
      created_at: new Date(Date.now() - 15000).toISOString(), // 15秒前
      updated_at: new Date().toISOString(),
    });

    // ジョブキューからnullを返すようにモック
    require("@/lib/jobQueue").getJob.mockReturnValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("processing");
    expect(data.progress).toBeGreaterThan(0);
  });

  test("returns completed status and result for completed session", async () => {
    // 完了したセッションを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionById.mockResolvedValueOnce({
      id: "test-id",
      user_id: "mock-user-id",
      status: "completed",
      query: "test query",
      research_results: [
        {
          summary: "Test summary",
          details: "Test details",
          sources: [{ url: "https://example.com", title: "Example" }],
          related_topics: ["Topic 1", "Topic 2"],
        },
      ],
    });

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("completed");
    expect(data.progress).toBe(100);
    expect(data.result).toBeDefined();
    expect(data.result.summary).toBe("Test summary");
  });

  test("handles server error gracefully", async () => {
    console.error = jest.fn(); // コンソールエラーをモック

    // getResearchSessionByIdでエラーを発生させる
    require("@/lib/supabaseCRUD").getResearchSessionById.mockRejectedValueOnce(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/research/status?sessionId=test-id");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("進捗状況の取得中にエラーが発生しました");
    expect(console.error).toHaveBeenCalled();
  });
});
