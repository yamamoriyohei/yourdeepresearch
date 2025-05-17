import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 公開ルートの定義
const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public/(.*)",
  "/api/clerk-webhook(.*)",
  "/api/test-supabase(.*)"
];

// 公開ルートマッチャーの作成
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware({
  // デバッグモードを有効化（本番環境では無効化）
  debug: process.env.NODE_ENV === "development",
  
  // 認証後の処理
  afterAuth(auth, req) {
    // 認証されていないユーザーが非公開ルートにアクセスした場合
    if (!auth.userId && !isPublicRoute(req.url)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

// マッチャーの設定
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/"
  ],
};
