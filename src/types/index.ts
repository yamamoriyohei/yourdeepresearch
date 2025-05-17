// リサーチ関連の型定義
// ------------------------------------------------------------

/**
 * リサーチリクエスト
 */
export interface ResearchRequest {
  /**
   * 研究対象のトピック
   */
  query: string;

  /**
   * 最大検索深度（何段階のリンクを辿るか）
   * @default 3
   */
  maxDepth?: number;

  /**
   * ソースリンクを含めるかどうか
   * @default true
   */
  includeSourceLinks?: boolean;

  /**
   * レポートの組織名（任意）
   */
  reportOrganization?: string;
}

/**
 * リサーチレスポンス
 */
export interface ResearchResponse {
  /**
   * リサーチのトピック
   */
  topic: string;

  /**
   * 導入部
   */
  introduction: string;

  /**
   * コンテンツセクション
   */
  sections: ResearchSection[];

  /**
   * 結論
   */
  conclusion: string;

  /**
   * 参考文献リスト
   */
  references: string[];

  /**
   * 関連トピック
   */
  relatedTopics?: string[];
}

/**
 * リサーチセクション
 */
export interface ResearchSection {
  /**
   * セクションタイトル
   */
  title: string;

  /**
   * セクション内容
   */
  content: string;

  /**
   * 参考文献（このセクションで使用）
   */
  references: string[];
}

/**
 * ソース情報
 */
export interface Source {
  /**
   * ソースのURL
   */
  url: string;

  /**
   * ソースのタイトル（オプション）
   */
  title?: string;

  /**
   * 関連性スコア（オプション）
   */
  relevanceScore?: number;
}

// データベース関連の型定義
// ------------------------------------------------------------

/**
 * リサーチセッション
 */
export interface ResearchSession {
  /**
   * セッションID
   */
  id: string;

  /**
   * ユーザーID
   */
  user_id: string;

  /**
   * クエリ（検索トピック）
   */
  query: string;

  /**
   * 処理状態
   */
  status: "processing" | "completed" | "failed";

  /**
   * 作成日時
   */
  created_at: string;

  /**
   * 更新日時
   */
  updated_at?: string;

  /**
   * 関連するリサーチ結果
   */
  research_results?: ResearchResult[];
}

/**
 * リサーチ結果
 */
export interface ResearchResult {
  /**
   * 結果ID
   */
  id: string;

  /**
   * セッションID
   */
  session_id: string;

  /**
   * 要約
   */
  summary: string;

  /**
   * 詳細
   */
  details: string;

  /**
   * 関連トピック
   */
  related_topics: string[];

  /**
   * 作成日時
   */
  created_at: string;

  /**
   * ソース情報
   */
  sources?: Source[];
}

/**
 * データベースソース
 */
export interface DatabaseSource {
  /**
   * ソースID
   */
  id: string;

  /**
   * リサーチ結果ID
   */
  research_result_id: string;

  /**
   * URL
   */
  url: string;

  /**
   * タイトル
   */
  title: string;

  /**
   * 関連性スコア
   */
  relevance_score?: number;

  /**
   * 作成日時
   */
  created_at?: string;
}

/**
 * ユーザー情報
 */
export interface User {
  /**
   * ユーザーID
   */
  id: string;

  /**
   * メールアドレス
   */
  email: string;

  /**
   * 名
   */
  first_name?: string;

  /**
   * 姓
   */
  last_name?: string;

  /**
   * 作成日時
   */
  created_at: string;

  /**
   * アバターURL
   */
  avatar_url?: string;
}

// API関連の型定義
// ------------------------------------------------------------

/**
 * API進捗ステータス
 */
export interface ProgressStatus {
  /**
   * 処理状態
   */
  status: "idle" | "processing" | "completed" | "failed";

  /**
   * 進捗率（0-100）
   */
  progress: number;

  /**
   * 進捗メッセージ
   */
  message: string;

  /**
   * エラーメッセージ（存在する場合）
   */
  error?: string;

  /**
   * 結果データ（処理完了時）
   */
  result?: any;
}

/**
 * API検索リクエスト
 */
export interface APISearchRequest {
  /**
   * 検索クエリ
   */
  query: string;

  /**
   * ユーザーID（フィルタリング用）
   */
  userId?: string;

  /**
   * 結果数制限
   */
  limit?: number;
}

/**
 * ジョブ情報
 */
export interface Job {
  /**
   * ジョブID
   */
  id: string;

  /**
   * 処理状態
   */
  status: "idle" | "processing" | "completed" | "failed";

  /**
   * 進捗率（0-100）
   */
  progress: number;

  /**
   * 進捗メッセージ
   */
  message: string;

  /**
   * 結果データ（処理完了時）
   */
  result?: any;

  /**
   * エラー情報（エラー時）
   */
  error?: Error;

  /**
   * 作成日時
   */
  createdAt: string;

  /**
   * 更新日時
   */
  updatedAt: string;
}

// システム定数
// ------------------------------------------------------------

/**
 * Supabaseテーブル名
 */
export enum Tables {
  USERS = "users",
  RESEARCH_SESSIONS = "research_sessions",
  RESEARCH_RESULTS = "research_results",
  SOURCES = "sources",
}
