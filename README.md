# Deep Research Agent

AIを活用した高度なリサーチエージェントアプリケーション。

## 機能

- ユーザー認証 (Clerk)
- 高度なリサーチ機能
- LangGraphを使用したワークフロー
- Supabaseによるデータ永続化
- Pineconeによるベクトル検索

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/deep-research-agent.git
cd deep-research-agent
```

2. 依存関係をインストール
```bash
pnpm install
```

3. 環境変数を設定
`.env.example`ファイルを`.env.local`にコピーして必要な値を設定します。

4. 開発サーバーを起動
```bash
pnpm dev
```

5. ブラウザで[http://localhost:3000](http://localhost:3000)にアクセス

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk (認証)
- Supabase (データベース)
- Pinecone (ベクトルデータベース)
- OpenAI API
- Tavily API (検索)
- LangGraph (ワークフロー)
