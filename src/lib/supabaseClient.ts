// supabaseClient.ts
// Supabaseクライアントの初期化を行います

import { createClient } from "@supabase/supabase-js";

// 環境変数からSupabase接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// 環境変数が設定されていない場合は警告を表示
if (!supabaseUrl) {
  console.warn(
    "Supabase URLが設定されていません。NEXT_PUBLIC_SUPABASE_URL環境変数を設定してください。"
  );
}
if (!supabaseAnonKey) {
  console.warn(
    "Supabase Anon Keyが設定されていません。NEXT_PUBLIC_SUPABASE_ANON_KEY環境変数を設定してください。"
  );
}
if (!supabaseServiceKey) {
  console.warn(
    "Supabase Service Role Keyが設定されていません。SUPABASE_SERVICE_ROLE_KEY環境変数を設定してください。"
  );
}

// 通常のクライアント (認証済みユーザー用)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// サービスロールクライアント (バックエンド処理用)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Supabaseのテーブル名を定義
export const TABLES = {
  USERS: "users",
  RESEARCH_SESSIONS: "research_sessions",
  RESEARCH_RESULTS: "research_results",
  SOURCES: "sources",
};
