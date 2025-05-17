-- migrations/01_create_tables.sql
-- Supabaseのテーブルを作成するためのマイグレーションファイル

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Clerkのユーザーと一致するID
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リサーチセッションテーブル
CREATE TABLE IF NOT EXISTS public.research_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リサーチ結果テーブル
CREATE TABLE IF NOT EXISTS public.research_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.research_sessions(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    details TEXT NOT NULL,
    related_topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ソーステーブル
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_result_id UUID NOT NULL REFERENCES public.research_results(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    relevance_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON public.research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_results_session_id ON public.research_results(session_id);
CREATE INDEX IF NOT EXISTS idx_sources_research_result_id ON public.sources(research_result_id);

-- RLSポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのRLSポリシー
CREATE POLICY "ユーザーは自分のデータのみ参照可能" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のデータのみ更新可能" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- リサーチセッションテーブルのRLSポリシー
CREATE POLICY "ユーザーは自分のセッションのみ参照可能" ON public.research_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のセッションのみ作成可能" ON public.research_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のセッションのみ更新可能" ON public.research_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のセッションのみ削除可能" ON public.research_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- リサーチ結果テーブルのRLSポリシー
CREATE POLICY "ユーザーは自分の結果のみ参照可能" ON public.research_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_sessions
            WHERE research_sessions.id = research_results.session_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分の結果のみ作成可能" ON public.research_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.research_sessions
            WHERE research_sessions.id = research_results.session_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分の結果のみ更新可能" ON public.research_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.research_sessions
            WHERE research_sessions.id = research_results.session_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分の結果のみ削除可能" ON public.research_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.research_sessions
            WHERE research_sessions.id = research_results.session_id
            AND research_sessions.user_id = auth.uid()
        )
    );

-- ソーステーブルのRLSポリシー
CREATE POLICY "ユーザーは自分のソースのみ参照可能" ON public.sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_results
            JOIN public.research_sessions ON research_sessions.id = research_results.session_id
            WHERE research_results.id = sources.research_result_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分のソースのみ作成可能" ON public.sources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.research_results
            JOIN public.research_sessions ON research_sessions.id = research_results.session_id
            WHERE research_results.id = sources.research_result_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分のソースのみ更新可能" ON public.sources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.research_results
            JOIN public.research_sessions ON research_sessions.id = research_results.session_id
            WHERE research_results.id = sources.research_result_id
            AND research_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザーは自分のソースのみ削除可能" ON public.sources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.research_results
            JOIN public.research_sessions ON research_sessions.id = research_results.session_id
            WHERE research_results.id = sources.research_result_id
            AND research_sessions.user_id = auth.uid()
        )
    );

-- サービスロール用のポリシー（バックエンド処理用）
-- これらのポリシーはサービスロールキーを使用する場合に適用されます
CREATE POLICY "サービスロールは全てのユーザーデータにアクセス可能" ON public.users
    FOR ALL USING (true);

CREATE POLICY "サービスロールは全てのセッションにアクセス可能" ON public.research_sessions
    FOR ALL USING (true);

CREATE POLICY "サービスロールは全ての結果にアクセス可能" ON public.research_results
    FOR ALL USING (true);

CREATE POLICY "サービスロールは全てのソースにアクセス可能" ON public.sources
    FOR ALL USING (true);
