// supabaseCRUD.ts
// Supabaseのデータ操作関数を実装します

import { supabaseClient, supabaseAdmin, TABLES } from "./supabaseClient";

// ユーザープロファイルのインターフェース
export interface UserProfile {
  id: string; // UUID、auth.users.idと一致
  username?: string;
  avatar_url?: string;
  updated_at?: string;
}

// リサーチセッションのインターフェース
export interface ResearchSession {
  id: string;
  user_id: string;
  query: string;
  status: "processing" | "completed" | "failed";
  created_at: string;
  updated_at?: string;
}

// リサーチ結果のインターフェース
export interface ResearchResult {
  id: string;
  session_id: string;
  summary: string;
  details: string;
  related_topics: string[];
  created_at: string;
}

// ソースのインターフェース
export interface Source {
  id: string;
  research_result_id: string;
  url: string;
  title: string;
  relevance_score?: number;
  created_at?: string;
}

// --- ユーザー関連の操作 ---

// ユーザー作成
export async function createUser(userId: string, userData: any) {
  const { data, error } = await supabaseAdmin
    .from(TABLES.USERS)
    .insert([{ id: userId, ...userData }]);

  if (error) throw error;
  return data;
}

// ユーザー取得
export async function getUserById(userId: string) {
  const { data, error } = await supabaseClient
    .from(TABLES.USERS)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// ユーザープロファイル取得
export async function getUserProfile(userId: string) {
  return getUserById(userId);
}

// ユーザープロファイル更新
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabaseClient
    .from(TABLES.USERS)
    .update(updates)
    .eq("id", userId)
    .select();

  if (error) throw error;
  return data[0];
}

// --- リサーチセッション関連の操作 ---

// リサーチセッション作成
export async function createResearchSession(sessionData: Omit<ResearchSession, "id">) {
  const { data, error } = await supabaseClient
    .from(TABLES.RESEARCH_SESSIONS)
    .insert([sessionData])
    .select();

  if (error) throw error;
  return data[0];
}

// ユーザーのリサーチセッション一覧取得
export async function getResearchSessionsByUserId(userId: string) {
  const { data, error } = await supabaseClient
    .from(TABLES.RESEARCH_SESSIONS)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// リサーチセッション取得
export async function getResearchSessionById(sessionId: string) {
  try {
    console.log(`Fetching research session with ID: ${sessionId}`);

    // まずセッション情報のみを取得
    const { data: session, error: sessionError } = await supabaseClient
      .from(TABLES.RESEARCH_SESSIONS)
      .select('*')
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error(`Error fetching session: ${sessionError.message}`);
      throw sessionError;
    }

    if (!session) {
      console.log(`No session found with ID: ${sessionId}`);
      return null;
    }

    // 次にリサーチ結果を取得
    const { data: results, error: resultsError } = await supabaseClient
      .from(TABLES.RESEARCH_RESULTS)
      .select('*')
      .eq("session_id", sessionId);

    if (resultsError) {
      console.error(`Error fetching results: ${resultsError.message}`);
      // 結果取得のエラーは無視してセッション情報のみ返す
      return session;
    }

    // 結果があれば、それぞれのソースを取得
    if (results && results.length > 0) {
      const resultId = results[0].id;

      const { data: sources, error: sourcesError } = await supabaseClient
        .from(TABLES.SOURCES)
        .select('*')
        .eq("research_result_id", resultId);

      if (sourcesError) {
        console.error(`Error fetching sources: ${sourcesError.message}`);
        // ソース取得のエラーは無視
        return {
          ...session,
          research_results: results
        };
      }

      // 全ての情報を結合して返す
      return {
        ...session,
        research_results: [
          {
            ...results[0],
            sources: sources || []
          }
        ]
      };
    }

    // 結果がない場合はセッション情報のみ返す
    return session;
  } catch (error) {
    console.error(`Error in getResearchSessionById: ${error.message}`);
    throw error;
  }
}

// リサーチセッションのステータス更新
export async function updateResearchSession(
  sessionId: string,
  updates: { status: "processing" | "completed" | "failed"; updated_at?: string }
) {
  // 更新日時が指定されていない場合は現在時刻を使用
  if (!updates.updated_at) {
    updates.updated_at = new Date().toISOString();
  }

  const { data, error } = await supabaseClient
    .from(TABLES.RESEARCH_SESSIONS)
    .update(updates)
    .eq("id", sessionId)
    .select();

  if (error) throw error;
  return data[0];
}

// --- リサーチ結果関連の操作 ---

// リサーチ結果保存
export async function saveResearchResult(resultData: Omit<ResearchResult, "id">) {
  const { data, error } = await supabaseClient
    .from(TABLES.RESEARCH_RESULTS)
    .insert([resultData])
    .select();

  if (error) throw error;
  return data[0];
}

// リサーチ結果取得
export async function getResearchResultById(resultId: string) {
  try {
    console.log(`Fetching research result with ID: ${resultId}`);

    // まず結果情報のみを取得
    const { data: result, error: resultError } = await supabaseClient
      .from(TABLES.RESEARCH_RESULTS)
      .select('*')
      .eq("id", resultId)
      .single();

    if (resultError) {
      console.error(`Error fetching result: ${resultError.message}`);
      throw resultError;
    }

    if (!result) {
      console.log(`No result found with ID: ${resultId}`);
      return null;
    }

    // 次にソース情報を取得
    const { data: sources, error: sourcesError } = await supabaseClient
      .from(TABLES.SOURCES)
      .select('*')
      .eq("research_result_id", resultId);

    if (sourcesError) {
      console.error(`Error fetching sources: ${sourcesError.message}`);
      // ソース取得のエラーは無視して結果情報のみ返す
      return result;
    }

    // 結果とソースを結合して返す
    return {
      ...result,
      sources: sources || []
    };
  } catch (error) {
    console.error(`Error in getResearchResultById: ${error.message}`);
    throw error;
  }
}

// --- ソース関連の操作 ---

// ソース保存
export async function saveSources(sources: Omit<Source, "id" | "created_at">[]) {
  const { data, error } = await supabaseClient.from(TABLES.SOURCES).insert(sources).select();

  if (error) throw error;
  return data;
}

/*
Supabaseテーブルスキーマ例 (SQL):

-- ユーザーテーブル
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Securityを有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ポリシー: ユーザーは自分のプロファイルのみ表示可能
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
-- ポリシー: ユーザーは自分のプロファイルのみ更新可能
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- リサーチセッションテーブル
CREATE TABLE public.research_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Securityを有効化
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;
-- ポリシー: ユーザーは自分のセッションのみ表示可能
CREATE POLICY "Users can view their own sessions." ON public.research_sessions FOR SELECT USING (auth.uid() = user_id);
-- ポリシー: ユーザーは自分のセッションのみ作成可能
CREATE POLICY "Users can create their own sessions." ON public.research_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- リサーチ結果テーブル
CREATE TABLE public.research_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.research_sessions(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  related_topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Securityを有効化
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;
-- ポリシー: ユーザーは自分の結果のみ表示可能
CREATE POLICY "Users can view their own results." ON public.research_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_sessions s
      WHERE s.id = research_results.session_id AND s.user_id = auth.uid()
    )
  );

-- ソーステーブル
CREATE TABLE public.sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  relevance_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Row Level Securityを有効化
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
-- ポリシー: ユーザーは自分のソースのみ表示可能
CREATE POLICY "Users can view their own sources." ON public.sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_results r
      JOIN public.research_sessions s ON r.session_id = s.id
      WHERE r.id = sources.research_result_id AND s.user_id = auth.uid()
    )
  );
*/
