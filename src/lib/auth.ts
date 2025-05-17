import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * 認証済みユーザーのIDを取得する関数
 * @returns ユーザーID（未認証の場合はundefined）
 */
export async function getAuthenticatedUserId() {
  const user = await currentUser();
  return user?.id;
}

/**
 * 認証が必要なAPIハンドラーを作成する高階関数
 * @param handler 認証済みユーザーIDを受け取るハンドラー関数
 * @returns NextRequest を受け取り、認証チェック後にハンドラーを実行する関数
 */
export function withAuth<T>(
  handler: (req: NextRequest, userId: string) => Promise<T>
) {
  return async (req: NextRequest) => {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    try {
      const result = await handler(req, userId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("API Error:", error);

      return NextResponse.json(
        {
          error: error.message || "サーバーエラーが発生しました",
          details: process.env.NODE_ENV === "development" ? error : undefined
        },
        { status: error.status || 500 }
      );
    }
  };
}
