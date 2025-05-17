import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "@/types/api";

/**
 * APIハンドラーをラップしてエラーハンドリングを統一する関数
 * @param handler APIハンドラー関数
 * @returns エラーハンドリングを含むラップされたハンドラー関数
 */
export function withErrorHandling<T>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest) => {
    try {
      const result = await handler(req);
      return NextResponse.json(createSuccessResponse(result));
    } catch (error: any) {
      console.error(`API Error:`, error);
      
      // データベースエラーの処理
      if (error.code === '42P01') {
        return NextResponse.json(
          createErrorResponse(
            "データベーステーブルが存在しません。マイグレーションを実行してください。",
            "DB_TABLE_NOT_FOUND",
            error
          ),
          { status: 500 }
        );
      }
      
      // 認証エラーの処理
      if (error.message === "認証が必要です") {
        return NextResponse.json(
          createErrorResponse(
            error.message,
            "UNAUTHORIZED"
          ),
          { status: 401 }
        );
      }
      
      // バリデーションエラーの処理
      if (error.code === "VALIDATION_ERROR") {
        return NextResponse.json(
          createErrorResponse(
            error.message,
            error.code,
            error.details
          ),
          { status: 400 }
        );
      }
      
      // その他のエラー
      return NextResponse.json(
        createErrorResponse(
          error.message || "サーバーエラーが発生しました",
          error.code,
          process.env.NODE_ENV === "development" ? error : undefined
        ),
        { status: error.status || 500 }
      );
    }
  };
}

/**
 * 認証とエラーハンドリングを組み合わせたラッパー関数
 * @param getAuthUserId 認証済みユーザーIDを取得する関数
 * @param handler 認証済みユーザーIDを受け取るハンドラー関数
 * @returns 認証とエラーハンドリングを含むラップされたハンドラー関数
 */
export function withAuthAndErrorHandling<T>(
  getAuthUserId: () => Promise<string | undefined>,
  handler: (req: NextRequest, userId: string) => Promise<T>
) {
  return withErrorHandling(async (req: NextRequest) => {
    const userId = await getAuthUserId();
    
    if (!userId) {
      throw new Error("認証が必要です");
    }
    
    return handler(req, userId);
  });
}
