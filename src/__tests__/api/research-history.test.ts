import { NextRequest } from "next/server";
import { GET } from "@/app/api/research/history/route";

// モック
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "mock-user-id" })),
}));

jest.mock("@/lib/supabaseCRUD", () => ({
  getResearchSessionsByUserId: jest.fn(),
}));

describe("Research History API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 when user is not authenticated", async () => {
    // authモックを上書きして未認証状態をシミュレート
    require("@clerk/nextjs/server").auth.mockReturnValueOnce({ userId: null });

    const request = new NextRequest("http://localhost:3000/api/research/history");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("認証が必要です");
  });

  test("returns user research sessions", async () => {
    // モックセッションデータ
    const mockSessions = [
      {
        id: "session-1",
        user_id: "mock-user-id",
        query: "test query 1",
        status: "completed",
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        id: "session-2",
        user_id: "mock-user-id",
        query: "test query 2",
        status: "processing",
        created_at: "2023-01-02T00:00:00Z",
      },
    ];

    // getResearchSessionsByUserIdがモックセッションを返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionsByUserId.mockResolvedValueOnce(mockSessions);

    const request = new NextRequest("http://localhost:3000/api/research/history");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessions).toEqual(mockSessions);
    expect(data.sessions.length).toBe(2);
  });

  test("returns empty array when user has no sessions", async () => {
    // getResearchSessionsByUserIdが空の配列を返すようにモック
    require("@/lib/supabaseCRUD").getResearchSessionsByUserId.mockResolvedValueOnce([]);

    const request = new NextRequest("http://localhost:3000/api/research/history");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessions).toEqual([]);
  });

  test("handles server error gracefully", async () => {
    console.error = jest.fn(); // コンソールエラーをモック

    // getResearchSessionsByUserIdでエラーを発生させる
    require("@/lib/supabaseCRUD").getResearchSessionsByUserId.mockRejectedValueOnce(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/research/history");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("リサーチ履歴の取得中にエラーが発生しました");
    expect(console.error).toHaveBeenCalled();
  });
});
