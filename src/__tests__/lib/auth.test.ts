import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, withAuth } from "@/lib/auth";

// モック
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import { currentUser } from "@clerk/nextjs/server";

describe("認証ヘルパー関数", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthenticatedUserId", () => {
    it("認証済みユーザーのIDを返す", async () => {
      // モックの設定
      (currentUser as jest.Mock).mockResolvedValue({
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
      });

      // 関数の実行
      const userId = await getAuthenticatedUserId();

      // 結果の検証
      expect(userId).toBe("test-user-id");
      expect(currentUser).toHaveBeenCalled();
    });

    it("未認証の場合はundefinedを返す", async () => {
      // モックの設定
      (currentUser as jest.Mock).mockResolvedValue(null);

      // 関数の実行
      const userId = await getAuthenticatedUserId();

      // 結果の検証
      expect(userId).toBeUndefined();
      expect(currentUser).toHaveBeenCalled();
    });
  });

  describe("withAuth", () => {
    it("認証済みの場合はハンドラーを実行する", async () => {
      // モックの設定
      (currentUser as jest.Mock).mockResolvedValue({
        id: "test-user-id",
      });

      // モックハンドラー
      const mockHandler = jest.fn().mockResolvedValue({ data: "test-data" });
      const wrappedHandler = withAuth(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req, "test-user-id");
      expect(NextResponse.json).toHaveBeenCalledWith({ data: "test-data" });
      expect(result).toBe(mockJsonResponse);
    });

    it("未認証の場合は401エラーを返す", async () => {
      // モックの設定
      (currentUser as jest.Mock).mockResolvedValue(null);

      // モックハンドラー
      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "認証が必要です" },
        { status: 401 }
      );
      expect(result).toBe(mockJsonResponse);
    });

    it("ハンドラーがエラーをスローした場合はエラーレスポンスを返す", async () => {
      // モックの設定
      (currentUser as jest.Mock).mockResolvedValue({
        id: "test-user-id",
      });

      // エラーをスローするモックハンドラー
      const testError = new Error("テストエラー");
      const mockHandler = jest.fn().mockRejectedValue(testError);
      const wrappedHandler = withAuth(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req, "test-user-id");
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "テストエラー",
          details: expect.anything(),
        }),
        { status: 500 }
      );
      expect(result).toBe(mockJsonResponse);
    });
  });
});
