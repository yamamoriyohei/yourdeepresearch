# データベースマイグレーション

このディレクトリには、Supabaseデータベースのマイグレーションファイルが含まれています。

## マイグレーションの実行方法

### 方法1: Supabaseダッシュボードを使用する

1. [Supabaseダッシュボード](https://app.supabase.io)にログインします。
2. プロジェクトを選択します。
3. 左側のメニューから「SQL Editor」を選択します。
4. 「New Query」をクリックします。
5. マイグレーションファイルの内容をコピー＆ペーストします。
6. 「Run」をクリックして実行します。

### 方法2: Supabase CLIを使用する

1. Supabase CLIをインストールします（まだの場合）:
   ```bash
   npm install -g supabase
   ```

2. ログインします:
   ```bash
   supabase login
   ```

3. マイグレーションを実行します:
   ```bash
   supabase db push
   ```

## マイグレーションファイル

- `01_create_tables.sql`: 基本テーブル（users, research_sessions, research_results, sources）の作成
- `02_clerk_webhook_functions.sql`: Clerkのwebhookを処理するための関数

## 注意事項

- マイグレーションは順番に実行してください。
- 既存のデータがある場合は、バックアップを取ってから実行してください。
- RLSポリシーは、セキュリティ要件に応じて調整してください。
