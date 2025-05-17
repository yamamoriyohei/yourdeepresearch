/**
 * API成功レスポンスの型定義
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * APIエラーレスポンスの型定義
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * API共通レスポンスの型定義
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 成功レスポンスを作成する関数
 * @param data レスポンスデータ
 * @returns 標準化された成功レスポンス
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * エラーレスポンスを作成する関数
 * @param message エラーメッセージ
 * @param code エラーコード（オプション）
 * @param details エラー詳細（オプション）
 * @returns 標準化されたエラーレスポンス
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details
    }
  };
}
