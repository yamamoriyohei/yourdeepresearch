-- migrations/00_drop_tables.sql
-- 既存のテーブルを削除するためのマイグレーションファイル

-- 外部キー制約を持つテーブルから順に削除
DROP TABLE IF EXISTS public.sources;
DROP TABLE IF EXISTS public.research_results;
DROP TABLE IF EXISTS public.research_sessions;
DROP TABLE IF EXISTS public.users;

-- RLSポリシーも削除
DROP POLICY IF EXISTS "ユーザーは自分のデータのみ参照可能" ON public.users;
DROP POLICY IF EXISTS "ユーザーは自分のデータのみ更新可能" ON public.users;
DROP POLICY IF EXISTS "ユーザーは自分のセッションのみ参照可能" ON public.research_sessions;
DROP POLICY IF EXISTS "ユーザーは自分のセッションのみ作成可能" ON public.research_sessions;
DROP POLICY IF EXISTS "ユーザーは自分のセッションのみ更新可能" ON public.research_sessions;
DROP POLICY IF EXISTS "ユーザーは自分のセッションのみ削除可能" ON public.research_sessions;
DROP POLICY IF EXISTS "ユーザーは自分の結果のみ参照可能" ON public.research_results;
DROP POLICY IF EXISTS "ユーザーは自分の結果のみ作成可能" ON public.research_results;
DROP POLICY IF EXISTS "ユーザーは自分の結果のみ更新可能" ON public.research_results;
DROP POLICY IF EXISTS "ユーザーは自分の結果のみ削除可能" ON public.research_results;
DROP POLICY IF EXISTS "ユーザーは自分のソースのみ参照可能" ON public.sources;
DROP POLICY IF EXISTS "ユーザーは自分のソースのみ作成可能" ON public.sources;
DROP POLICY IF EXISTS "ユーザーは自分のソースのみ更新可能" ON public.sources;
DROP POLICY IF EXISTS "ユーザーは自分のソースのみ削除可能" ON public.sources;
DROP POLICY IF EXISTS "サービスロールは全てのユーザーデータにアクセス可能" ON public.users;
DROP POLICY IF EXISTS "サービスロールは全てのセッションにアクセス可能" ON public.research_sessions;
DROP POLICY IF EXISTS "サービスロールは全ての結果にアクセス可能" ON public.research_results;
DROP POLICY IF EXISTS "サービスロールは全てのソースにアクセス可能" ON public.sources;
