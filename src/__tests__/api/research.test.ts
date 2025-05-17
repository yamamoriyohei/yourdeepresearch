import { NextRequest } from "next/server";
import { POST } from "@/app/api/research/route";

// モック
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "mock-user-id" })),
}));

jest.mock("@/lib/supabaseCRUD", () => ({
  createResearchSession: jest.fn(() => Promise.resolve({ id: "mock-session-id" })),
  saveResearchResult: jest.fn(() => Promise.resolve({ id: "mock-result-id" })),
  saveSources: jest.fn(() => Promise.resolve([])),
  updateResearchSession: jest.fn(() => Promise.resolve({})),
}));

jest.mock("@/lib/openDeepResearch", () => ({
  performResearch: jest.fn(() =>
    Promise.resolve({
      summary: "Mock summary",
      details: "Mock details",
      sources: ["https://example.com"],
      relatedTopics: ["Topic 1", "Topic 2"],
    })
  ),
}));

jest.mock("@/lib/jobQueue", () => ({
  createJob: jest.fn(() => ({ id: "mock-job-id" })),
  executeJob: jest.fn((id, task) => task(() => {})),
}));

describe("Research API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    // authモックを上書きして未認証状態をシミュレート
    require("@clerk/nextjs/server").auth.mockReturnValueOnce({ userId: null });

    const request = new NextRequest("http://localhost:3000/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("認証が必要です");
  });

  test("returns 400 when query is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/research", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("クエリは必須");
  });

  test("creates research session and starts background job", async () => {
    const createResearchSession = require("@/lib/supabaseCRUD").createResearchSession;
    const executeJob = require("@/lib/jobQueue").executeJob;

    const request = new NextRequest("http://localhost:3000/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("mock-session-id");
    expect(data.message).toContain("リサーチが開始されました");

    // セッションが作成されたことを確認
    expect(createResearchSession).toHaveBeenCalledWith({
      user_id: "mock-user-id",
      query: "test query",
      status: "processing",
      created_at: expect.any(String),
    });

    // バックグラウンドジョブが開始されたことを確認
    expect(executeJob).toHaveBeenCalled();
  });

  test("handles server error gracefully", async () => {
    console.error = jest.fn(); // コンソールエラーをモック

    // createResearchSessionでエラーを発生させる
    require("@/lib/supabaseCRUD").createResearchSession.mockRejectedValueOnce(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/research", {
      method: "POST",
      body: JSON.stringify({ query: "test query" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("リサーチの実行中にエラーが発生しました");
    expect(console.error).toHaveBeenCalled();
  });
});
