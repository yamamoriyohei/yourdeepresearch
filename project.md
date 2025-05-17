# Deep Research Agent プロジェクト計画

## プロジェクト概要

Deep Research Agentは、AIを活用した高度なリサーチエージェントアプリケーションです。ユーザーが入力したトピックに基づいて、Tavilyを使用したウェブ検索とOpenAIを使用した文章生成を組み合わせ、包括的なリサーチレポートを作成します。

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **認証**: Clerk
- **データベース**: Supabase
- **ベクトルデータベース**: Pinecone
- **AI/ML**: OpenAI API, LangChain, LangGraph
- **検索**: Tavily API

## アーキテクチャ

1. **フロントエンド層**
   - Next.js App Routerを使用したページ構成
   - Clerkによる認証
   - Tailwind CSSとshadcn/uiによるUI

2. **API層**
   - Next.js API Routesを使用したサーバーサイドエンドポイント
   - Clerkによる認証検証

3. **サービス層**
   - LangGraphを使用したワークフロー管理
   - OpenAI APIとの連携
   - Tavily APIとの連携

4. **データ層**
   - Supabaseによるリレーショナルデータ管理
   - Pineconeによるベクトルデータ管理

## ディレクトリ構造

```
deep-research-agent/
├── .env.local                 # 環境変数
├── next.config.mjs            # Next.js設定
├── package.json               # 依存関係
├── tailwind.config.js         # Tailwind CSS設定
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── clerk-webhook/ # Clerk Webhook
│   │   │   └── research/      # リサーチAPI
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── research/          # リサーチページ
│   │   │   └── [id]/          # リサーチ結果ページ
│   │   ├── sign-in/           # サインインページ
│   │   └── sign-up/           # サインアップページ
│   ├── components/            # Reactコンポーネント
│   │   ├── ui/                # UI基本コンポーネント
│   │   └── ResearchForm.tsx   # リサーチフォーム
│   ├── lib/                   # ユーティリティとサービス
│   │   ├── openDeepResearch.ts # メインロジック
│   │   ├── openai.ts          # OpenAI連携
│   │   ├── tavily.ts          # Tavily連携
│   │   ├── supabaseClient.ts  # Supabase初期化
│   │   ├── supabaseCRUD.ts    # Supabase操作
│   │   ├── pineconeClient.ts  # Pinecone初期化
│   │   ├── pineconeCRUD.ts    # Pinecone操作
│   │   ├── langgraphState.ts  # LangGraph状態
│   │   ├── langgraphPrompts.ts # LangGraphプロンプト
│   │   ├── langgraphNodes.ts  # LangGraphノード
│   │   ├── langgraphService.ts # LangGraphサービス
│   │   └── utils.ts           # 共通ユーティリティ
│   ├── middleware.ts          # Clerk認証ミドルウェア
│   └── types/                 # 型定義
│       └── index.ts           # 共通型
```

## 実装計画

### フェーズ1: 基本設定とインフラストラクチャ

1. プロジェクト初期化とNext.js設定
2. Tailwind CSSとshadcn/ui設定
3. Clerk認証統合
4. Supabaseデータベース設定
5. Pineconeベクトルデータベース設定

### フェーズ2: コア機能実装

1. OpenAI API連携
2. Tavily API連携
3. LangGraph状態とプロンプト定義
4. LangGraphノードとサービス実装
5. リサーチワークフロー実装

### フェーズ3: フロントエンド実装

1. 認証ページ（サインイン/サインアップ）
2. ダッシュボードページ
3. リサーチフォームページ
4. リサーチ結果表示ページ
5. UI/UX改善

### フェーズ4: API実装とデータ永続化

1. リサーチAPIエンドポイント
2. Clerk Webhook処理
3. Supabaseデータ永続化
4. Pineconeベクトル保存と検索

### フェーズ5: テストとデプロイ

1. ユニットテスト
2. 統合テスト
3. パフォーマンス最適化
4. Vercelへのデプロイ
5. 本番環境モニタリング設定

## 実装チェックリスト

### フェーズ1: 基本設定とインフラストラクチャ

- [x] プロジェクト初期化とNext.js設定
- [x] Tailwind CSSとshadcn/ui設定
- [x] Clerk認証統合
- [x] Supabaseデータベース設定（クライアント初期化）
- [x] Pineconeベクトルデータベース設定（クライアント初期化）

### フェーズ2: コア機能実装

- [x] OpenAI API連携（基本実装）
- [x] Tavily API連携（基本実装）
- [x] LangGraph状態とプロンプト定義
- [x] LangGraphノードとサービス実装
- [ ] リサーチワークフロー実装（部分的に完了）

### フェーズ3: フロントエンド実装

- [x] 認証ページ（サインイン/サインアップ）
- [x] ダッシュボードページ（基本実装）
- [x] リサーチフォームページ
- [x] リサーチ結果表示ページ（基本実装）
- [ ] UI/UX改善（進行中）

### フェーズ4: API実装とデータ永続化

- [x] リサーチAPIエンドポイント（基本実装）
- [x] Clerk Webhook処理（基本実装）
- [ ] Supabaseデータ永続化（部分的に実装）
- [ ] Pineconeベクトル保存と検索（部分的に実装）

### フェーズ5: テストとデプロイ

- [ ] テスト環境のセットアップ
  - [ ] Jestのインストールと設定
  - [ ] React Testing Libraryのインストールと設定
  - [ ] Babelの設定
  - [ ] テスト用モックの作成
- [ ] ユニットテスト
  - [ ] コンポーネントのテスト
  - [ ] ユーティリティ関数のテスト
  - [ ] APIエンドポイントのテスト
- [ ] 統合テスト
  - [ ] ユーザーフローのテスト
  - [ ] データベース操作のテスト
- [ ] パフォーマンス最適化
  - [ ] データ取得の最適化
  - [ ] コンポーネントのメモ化
- [ ] Vercelへのデプロイ
  - [ ] 環境変数の設定
  - [ ] デプロイフックの設定
- [ ] 本番環境モニタリング設定
  - [ ] エラーロギングの設定
  - [ ] パフォーマンスモニタリングの設定

## 現在の進捗状況

プロジェクトは現在、フェーズ4と5の間にあります。基本的なフロントエンドUIとコア機能の実装は完了し、以下の項目が実装されました：

1. **リサーチワークフローの完全実装** ✅
   - LangGraphの実装とフロントエンドUIの連携が完了
   - リサーチ結果の形式が統一された

2. **データ永続化の完全実装** ✅
   - Supabaseへのリサーチ結果保存が完全に実装された
   - Pineconeへのベクトル保存と検索が完全に実装された

3. **UI/UX改善** ✅
   - リサーチ進行状況の表示機能を実装
   - エラーハンドリングの改善を実装
   - レスポンシブデザインの最適化を実装

4. **パフォーマンス最適化** ✅
   - リサーチ処理のバックグラウンドジョブ化を実装
   - キューイングシステムの導入

次のステップとして、以下の項目に取り組む必要があります：

1. **テストの実装**
   - ユニットテストの実装
   - 統合テストの実装

2. **デプロイ準備**
   - 環境変数の整理
   - Vercelデプロイ設定

## リファクタリング計画

### 1. UI/UX改善

#### 1.1 リサーチ進行状況の表示
- [x] プログレスバーコンポーネントの作成
- [x] ポーリングによる進捗状況の取得実装
- [x] バックエンドでの進捗追跡機能の実装
- [x] リアルタイム更新UIの実装

#### 1.2 エラーハンドリングの改善
- [x] グローバルエラーハンドリングコンポーネントの作成
- [x] エラータイプ別のメッセージテンプレートの作成
- [x] リトライ機能の実装
- [x] エラーログ機能の強化

#### 1.3 レスポンシブデザインの最適化
- [x] モバイルビューの最適化
- [x] タブレットビューの最適化
- [x] フレックスボックスとグリッドレイアウトの活用
- [x] タッチ操作の最適化

#### 1.4 ダッシュボードの機能拡張
- [x] リサーチ履歴一覧の実装
- [ ] リサーチ統計情報の表示
- [ ] お気に入りリサーチの保存機能
- [ ] リサーチのカテゴリ分類機能

### 2. コード品質の改善

#### 2.1 コンポーネントの整理
- [ ] 共通コンポーネントの抽出
- [ ] コンポーネント間の責務分離
- [ ] Atomic Designパターンの適用
- [ ] コンポーネントドキュメントの作成

#### 2.2 型定義の強化
- [ ] 厳密な型定義の追加
- [ ] インターフェースの統一
- [ ] 共通型の集約
- [ ] 型チェックの強化

#### 2.3 状態管理の改善
- [ ] 状態管理ライブラリの導入検討（React Context/Zustand）
- [ ] サーバー状態とクライアント状態の同期メカニズム改善
- [ ] グローバル状態の整理
- [ ] 状態更新ロジックの最適化

### 3. パフォーマンス最適化

#### 3.1 リサーチ処理の非同期化
- [x] バックグラウンドジョブ処理の実装
- [x] キューイングシステムの導入
- [x] 長時間実行タスクの管理
- [x] タイムアウト処理の実装

#### 3.2 データ取得の最適化
- [ ] データ取得のバッチ処理
- [ ] キャッシュの導入（React Query/SWR）
- [ ] クエリの最適化
- [ ] データプリフェッチの実装

#### 3.3 コンポーネントのメモ化
- [ ] React.memoの適用
- [ ] useMemo/useCallbackの適切な使用
- [ ] 不要な再レンダリングの防止
- [ ] レンダリングパフォーマンスの測定と改善

### 4. テスト実装

#### 4.1 ユニットテスト
- [x] テスト環境のセットアップ
  - [x] Jestのインストールと設定
  - [x] React Testing Libraryのインストールと設定
  - [x] Babelの設定
  - [x] テスト用モックの作成
- [x] コンポーネントのテスト（Jest + React Testing Library）
  - [x] ResearchProgressコンポーネントのテスト
  - [x] ErrorHandlerコンポーネントのテスト
  - [ ] ResearchFormコンポーネントのテスト
  - [ ] ResearchResultsコンポーネントのテスト
- [x] ユーティリティ関数のテスト
  - [ ] openai.tsの関数のテスト
  - [ ] supabaseCRUD.tsの関数のテスト
  - [ ] pineconeCRUD.tsの関数のテスト
  - [x] jobQueue.tsの関数のテスト
- [x] APIエンドポイントのテスト
  - [ ] /api/researchエンドポイントのテスト
  - [x] /api/research/statusエンドポイントのテスト
  - [x] /api/research/historyエンドポイントのテスト
- [x] モックとスタブの作成
  - [x] OpenAI APIのモック
  - [x] Tavilyのモック
  - [x] Supabaseのモック
  - [x] Pineconeのモック
  - [x] Clerk認証のモック

#### 4.2 統合テスト
- [ ] ユーザーフローのテスト（Cypress）
  - [ ] リサーチ実行フローのテスト
  - [ ] ダッシュボード表示フローのテスト
  - [ ] リサーチ結果表示フローのテスト
- [ ] APIとフロントエンドの統合テスト
  - [ ] リサーチAPIとフロントエンドの統合テスト
  - [ ] ステータスAPIとプログレス表示の統合テスト
- [ ] データベース操作のテスト
  - [ ] Supabase操作のテスト
  - [ ] Pinecone操作のテスト
- [ ] 認証フローのテスト
  - [ ] ログインフローのテスト
  - [ ] 権限制御のテスト

#### 4.3 E2Eテスト
- [ ] 完全なユーザージャーニーのテスト
  - [ ] ログインからリサーチ実行、結果確認までのフロー
  - [ ] ダッシュボードから過去のリサーチ結果を確認するフロー
- [ ] 異なるデバイスとブラウザでのテスト
  - [ ] デスクトップブラウザでのテスト
  - [ ] モバイルブラウザでのテスト
  - [ ] タブレットでのテスト
- [ ] パフォーマンステスト
  - [ ] ロードタイムの測定
  - [ ] リサーチ処理時間の測定
  - [ ] メモリ使用量の測定

### 5. デプロイ準備

#### 5.1 環境変数の整理
- [ ] .env.exampleファイルの作成
  - [ ] Clerk認証関連の環境変数
  - [ ] OpenAI API関連の環境変数
  - [ ] Supabase関連の環境変数
  - [ ] Pinecone関連の環境変数
  - [ ] Tavily関連の環境変数
- [ ] 環境変数のバリデーションスクリプトの作成
- [ ] 環境別設定の分離（開発/本番/テスト）
- [ ] シークレット管理の改善

#### 5.2 ビルド最適化
- [ ] コードの分割（Code Splitting）
  - [ ] ダイナミックインポートの導入
  - [ ] ルートベースのコード分割
- [ ] 静的アセットの最適化
  - [ ] 画像の最適化
  - [ ] フォントの最適化
- [ ] ビルドプロセスの自動化
  - [ ] ビルドスクリプトの作成
  - [ ] ビルドエラーチェックの実装
- [ ] バンドルサイズの最適化
  - [ ] 依存関係の整理
  - [ ] 不要なライブラリの削除

#### 5.3 Vercelデプロイ設定
- [ ] Vercelプロジェクトの作成
- [ ] vercel.json設定ファイルの作成
- [ ] 環境変数のVercelへの設定
- [ ] デプロイフックの設定
  - [ ] ビルド前のテスト実行
  - [ ] デプロイ後のヘルスチェック
- [ ] カスタムドメインの設定
- [ ] CI/CDパイプラインの構築
  - [ ] GitHub Actionsとの連携
  - [ ] 自動デプロイの設定

#### 5.4 本番環境モニタリング
- [ ] エラーロギングの設定
  - [ ] Sentryなどのエラー追跡サービスの導入
- [ ] パフォーマンスモニタリングの設定
  - [ ] Vercel Analyticsの設定
- [ ] アラートの設定
  - [ ] エラー発生時の通知設定
  - [ ] パフォーマンス低下時の通知設定

## 現在の優先タスク

以下の項目は完了しました：

1. ✅ **リサーチ進行状況の表示**（ユーザー体験の大幅な向上）
2. ✅ **リサーチ処理のバックグラウンドジョブ化**（パフォーマンスの大幅な向上）
3. ✅ **ダッシュボード機能の拡張**（ユーザー価値の向上）
4. ✅ **エラーハンドリングの改善**（ユーザー体験の向上）
5. ✅ **レスポンシブデザインの最適化**（モバイルユーザーの体験向上）
6. ✅ **テスト環境のセットアップ**（コード品質の向上）
   - ✅ Jestのインストールと設定
   - ✅ React Testing Libraryのインストールと設定
   - ✅ Babelの設定
   - ✅ テスト用モックの作成
7. ✅ **一部のユニットテスト実装**（コード品質の向上）
   - ✅ ErrorHandlerコンポーネントのテスト
   - ✅ ResearchProgressコンポーネントのテスト
   - ✅ jobQueueユーティリティのテスト
   - ✅ research/statusエンドポイントのテスト
   - ✅ research/historyエンドポイントのテスト

次に取り組むべき優先タスク：

1. **残りのユニットテストの実装**（コード品質の向上）
   - ResearchFormコンポーネントのテスト
   - ResearchResultsコンポーネントのテスト
   - openai.tsの関数のテスト
   - supabaseCRUD.tsの関数のテスト
   - pineconeCRUD.tsの関数のテスト
   - /api/researchエンドポイントのテスト

2. **コード品質の改善**（保守性の向上）
   - 共通コンポーネントの抽出
   - 型定義の強化と統一
   - コンポーネント間の責務分離

3. **パフォーマンス最適化**（ユーザー体験の向上）
   - React Query/SWRの導入によるデータフェッチの最適化
   - コンポーネントのメモ化
   - 不要な再レンダリングの防止

4. **環境変数の整理**（デプロイ準備）
   - .env.exampleファイルの作成
   - 環境変数のバリデーションスクリプトの作成

5. **Cypressによる統合テストの準備**（テスト網羅性の向上）
   - Cypressのインストールと設定
   - 基本的なE2Eテストシナリオの作成

## テスト環境のセットアップ手順

### 1. 必要なパッケージのインストール

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

### 2. Jestの設定ファイルの作成

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_app.tsx',
    '!src/**/_document.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest'],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@clerk|@tavily)/)',
  ],
};
```

### 3. Babelの設定ファイルの作成

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
```

### 4. Jestセットアップファイルの作成

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// モックの設定
jest.mock('@/lib/openai', () => ({
  getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  getChatCompletion: jest.fn().mockResolvedValue('Mock response'),
}));

jest.mock('@tavily/js', () => ({
  Tavily: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue({
      results: [
        {
          title: 'Mock Title',
          url: 'https://example.com',
          content: 'Mock Content',
          score: 0.95,
        },
      ],
    }),
  })),
}));

jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({
    userId: 'mock-user-id',
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  currentUser: jest.fn().mockResolvedValue({
    id: 'mock-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
  ClerkProvider: ({ children }) => children,
  useAuth: jest.fn().mockReturnValue({
    isSignedIn: true,
    userId: 'mock-user-id',
  }),
  useUser: jest.fn().mockReturnValue({
    isSignedIn: true,
    user: {
      id: 'mock-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
}));
```

### 5. package.jsonのスクリプト更新

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## 技術的な課題と解決策

1. **LangGraphとNext.jsの統合**
   - 解決策: サーバーサイドでLangGraphを実行し、結果をクライアントに返す

2. **長時間実行されるリサーチプロセスの処理**
   - 解決策: バックグラウンドジョブとしてリサーチを実行し、WebSocketまたはポーリングで進捗状況を更新

3. **大量のベクトルデータの効率的な管理**
   - 解決策: Pineconeのネームスペースとメタデータフィルタリングを活用

4. **認証とデータアクセス制御**
   - 解決策: ClerkのユーザーIDをSupabaseとPineconeのデータに関連付け、Row Level Securityを実装

5. **テスト環境の設定と外部依存関係のモック**
   - 解決策: JestとReact Testing Libraryを使用し、外部APIや認証サービスをモック化

## 詳細なリファクタリング次のステップ

### 残りのユニットテストの実装計画

1. **ResearchFormコンポーネントのテスト**
   - フォーム入力の検証テスト（空入力時のエラー表示）
   - APIリクエストのモックと成功/失敗時の動作検証
   - ローディング状態の表示テスト
   - `onSuccess`コールバックの呼び出しテスト
   - リダイレクト機能のテスト

2. **ResearchResultsコンポーネントのテスト**
   - 正しいデータ表示の検証
   - 日付フォーマットの正確性テスト
   - セクション表示の整合性テスト
   - 参考文献リンクの生成と表示テスト
   - レスポンシブ表示のテスト

3. **openai.tsの関数のテスト**
   - `generateWithOpenAI`関数のモックAPIレスポンステスト
   - `getEmbedding`関数のレスポンステスト
   - API_KEYがない場合のフォールバック動作テスト
   - エラーハンドリングと復旧メカニズムのテスト
   - レート制限時の挙動テスト

4. **supabaseCRUD.tsの関数のテスト**
   - ユーザー操作関連機能のテスト（作成/取得/更新）
   - リサーチセッション関連機能のテスト（作成/一覧取得/詳細取得/更新）
   - リサーチ結果保存と取得テスト
   - ソース情報操作のテスト
   - エラーハンドリングの検証

5. **pineconeCRUD.tsの関数のテスト**
   - `upsertResearchData`関数のテスト（ベクトルデータ挿入）
   - `searchSimilarResearch`関数のテスト（類似検索）
   - ユーザーIDによるフィルタリングのテスト
   - `getEmbeddingForPinecone`関数のテスト（ベクトル化機能）
   - エラー発生時のフォールバック機能のテスト

6. **/api/researchエンドポイントのテスト**
   - 認証チェックのテスト（未認証時の401レスポンス）
   - リクエストパラメータのバリデーションテスト（不正入力時の400レスポンス）
   - 正常リクエスト時のセッション作成とジョブ実行テスト
   - エラー発生時の適切なレスポンス返却テスト
   - ジョブキューとの連携テスト

### コード品質改善の具体的アプローチ

1. **共通コンポーネントの抽出**
   - リサーチ関連コンポーネントからの共通UI要素の抽出
   - `LoadingIndicator`、`ErrorDisplay`などの汎用コンポーネント作成
   - フォーム要素の共通化（バリデーション含む）
   - コンポーネントライブラリの整理とドキュメント化

2. **型定義の強化**
   - API関連の型定義を`types/api.ts`に集約
   - コンポーネントProps型の整理と統一
   - ユーティリティ型の作成と活用
   - nullableな値の厳密な型付け（Optional Chainingの活用）

3. **コンポーネント間の責務分離**
   - データ取得ロジックをカスタムフックに分離
   - 状態管理の整理（グローバル/ローカル）
   - プレゼンテーショナル/コンテナコンポーネントの分離
   - ビジネスロジックとUIの明確な分離

### パフォーマンス最適化計画

1. **React Queryによるデータフェッチ最適化**
   - キャッシュ設定の最適化（staleTime, cacheTime）
   - 自動再取得の設定（refetchOnWindowFocus, refetchInterval）
   - ページネーションクエリの実装
   - Mutation処理の最適化

2. **コンポーネントのメモ化戦略**
   - リスト表示コンポーネントの`React.memo`化
   - 高コストな計算の`useMemo`化
   - イベントハンドラの`useCallback`適用
   - 依存配列の最適化

3. **再レンダリング最適化**
   - React Devtoolsを使用したレンダリングボトルネックの特定
   - コンテキスト分割による再レンダリング範囲の限定
   - 状態更新の最適化（バッチ更新の活用）
   - 不変性の徹底（immer.jsの導入検討）

### 環境変数管理の改善

1. **.env.exampleファイルの整備**
   ```
   # 認証関連
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Supabase関連
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI関連
   OPENAI_API_KEY=your_openai_api_key
   
   # Pinecone関連
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=your_pinecone_index_name
   
   # Tavily関連
   TAVILY_API_KEY=your_tavily_api_key
   ```

2. **環境変数バリデーションスクリプトの作成**
   - 必須環境変数の存在チェック
   - 値のフォーマットバリデーション
   - 環境別設定の自動切り替え
   - エラーメッセージの詳細化

### 統合テスト実装計画

1. **Cypressの設定**
   - 基本設定と環境変数の整備
   - カスタムコマンドの実装（認証フロー等）
   - インターセプトの設定（APIモック）
   - テストレポート生成の設定

2. **主要テストシナリオ**
   - ユーザー認証フロー（サインアップ/ログイン/ログアウト）
   - リサーチ実行フロー（入力〜結果取得）
   - ダッシュボード機能（履歴表示/詳細表示）
   - エラーハンドリングテスト
   - レスポンシブ表示テスト（複数デバイスサイズ）
