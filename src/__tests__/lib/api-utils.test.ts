import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, withAuthAndErrorHandling } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/types/api";

// モック
jest.mock("@/types/api", () => ({
  createSuccessResponse: jest.fn((data) => ({ success: true, data })),
  createErrorResponse: jest.fn((message, code, details) => ({
    success: false,
    error: { message, code, details },
  })),
}));

describe("APIユーティリティ関数", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("withErrorHandling", () => {
    it("ハンドラーが成功した場合は成功レスポンスを返す", async () => {
      // モックハンドラー
      const mockHandler = jest.fn().mockResolvedValue({ data: "test-data" });
      const wrappedHandler = withErrorHandling(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(createSuccessResponse).toHaveBeenCalledWith({ data: "test-data" });
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { data: "test-data" },
      });
      expect(result).toBe(mockJsonResponse);
    });

    it("データベーステーブルが存在しないエラーの場合は適切なエラーレスポンスを返す", async () => {
      // エラーをスローするモックハンドラー
      const dbError = new Error("テーブルが存在しません");
      dbError.code = "42P01";
      const mockHandler = jest.fn().mockRejectedValue(dbError);
      const wrappedHandler = withErrorHandling(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(createErrorResponse).toHaveBeenCalledWith(
        "データベーステーブルが存在しません。マイグレーションを実行してください。",
        "DB_TABLE_NOT_FOUND",
        dbError
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: "データベーステーブルが存在しません。マイグレーションを実行してください。",
            code: "DB_TABLE_NOT_FOUND",
            details: dbError,
          },
        },
        { status: 500 }
      );
      expect(result).toBe(mockJsonResponse);
    });

    it("認証エラーの場合は401エラーレスポンスを返す", async () => {
      // エラーをスローするモックハンドラー
      const authError = new Error("認証が必要です");
      const mockHandler = jest.fn().mockRejectedValue(authError);
      const wrappedHandler = withErrorHandling(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(createErrorResponse).toHaveBeenCalledWith(
        "認証が必要です",
        "UNAUTHORIZED"
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: "認証が必要です",
            code: "UNAUTHORIZED",
            details: undefined,
          },
        },
        { status: 401 }
      );
      expect(result).toBe(mockJsonResponse);
    });

    it("バリデーションエラーの場合は400エラーレスポンスを返す", async () => {
      // エラーをスローするモックハンドラー
      const validationError = new Error("入力が無効です");
      validationError.code = "VALIDATION_ERROR";
      validationError.details = { field: "query", message: "必須項目です" };
      const mockHandler = jest.fn().mockRejectedValue(validationError);
      const wrappedHandler = withErrorHandling(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(createErrorResponse).toHaveBeenCalledWith(
        "入力が無効です",
        "VALIDATION_ERROR",
        validationError.details
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: "入力が無効です",
            code: "VALIDATION_ERROR",
            details: validationError.details,
          },
        },
        { status: 400 }
      );
      expect(result).toBe(mockJsonResponse);
    });

    it("その他のエラーの場合は500エラーレスポンスを返す", async () => {
      // エラーをスローするモックハンドラー
      const otherError = new Error("その他のエラー");
      const mockHandler = jest.fn().mockRejectedValue(otherError);
      const wrappedHandler = withErrorHandling(mockHandler);

      // モックリクエスト
      const req = new NextRequest("https://example.com");

      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);

      // 関数の実行
      const result = await wrappedHandler(req);

      // 結果の検証
      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(createErrorResponse).toHaveBeenCalledWith(
        "その他のエラー",
        undefined,
        otherError
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: "その他のエラー",
            code: undefined,
            details: otherError,
          },
        },
        { status: 500 }
      );
      expect(result).toBe(mockJsonResponse);
    });
  });

  describe("withAuthAndErrorHandling", () => {
    it("認証とエラーハンドリングを組み合わせる", async () => {
      // モックの認証関数
      const mockGetAuthUserId = jest.fn().mockResolvedValue("test-user-id");
      
      // モックハンドラー
      const mockHandler = jest.fn().mockResolvedValue({ data: "test-data" });
      
      // ラップされたハンドラー
      const wrappedHandler = withAuthAndErrorHandling(mockGetAuthUserId, mockHandler);
      
      // モックリクエスト
      const req = new NextRequest("https://example.com");
      
      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);
      
      // 関数の実行
      const result = await wrappedHandler(req);
      
      // 結果の検証
      expect(mockGetAuthUserId).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(req, "test-user-id");
      expect(createSuccessResponse).toHaveBeenCalledWith({ data: "test-data" });
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { data: "test-data" },
      });
      expect(result).toBe(mockJsonResponse);
    });
    
    it("認証に失敗した場合はエラーレスポンスを返す", async () => {
      // 認証に失敗するモック関数
      const mockGetAuthUserId = jest.fn().mockResolvedValue(undefined);
      
      // モックハンドラー
      const mockHandler = jest.fn();
      
      // ラップされたハンドラー
      const wrappedHandler = withAuthAndErrorHandling(mockGetAuthUserId, mockHandler);
      
      // モックリクエスト
      const req = new NextRequest("https://example.com");
      
      // NextResponse.jsonのモック
      const mockJsonResponse = { test: "error-response" };
      jest.spyOn(NextResponse, "json").mockReturnValue(mockJsonResponse as any);
      
      // 関数の実行
      const result = await wrappedHandler(req);
      
      // 結果の検証
      expect(mockGetAuthUserId).toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
      expect(createErrorResponse).toHaveBeenCalledWith(
        "認証が必要です",
        "UNAUTHORIZED"
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: "認証が必要です",
            code: "UNAUTHORIZED",
            details: undefined,
          },
        },
        { status: 401 }
      );
      expect(result).toBe(mockJsonResponse);
    });
  });
});
