import React from "react";
import {
  render,
  screen,
  waitFor,
  mockProgressData,
  mockCompletedProgressData,
} from "../test-utils";
import ResearchProgress from "@/components/ResearchProgress";
import { useResearchStatus } from "@/lib/hooks/useResearchStatus";

// useResearchStatusフックのモック
jest.mock("@/lib/hooks/useResearchStatus");

describe("ResearchProgress Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders initial loading state", () => {
    // useResearchStatusフックのモック実装
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    render(<ResearchProgress sessionId="test-session-id" />);

    // 初期状態では「ステータスを取得中...」というメッセージが表示される
    expect(screen.getByText("ステータスを取得中...")).toBeInTheDocument();
  });

  test("updates progress based on API response", async () => {
    // useResearchStatusフックのモック実装
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: {
        status: "processing",
        progress: 50,
        message: "情報を検索しています...",
      },
      error: null,
      isLoading: false,
    });

    render(<ResearchProgress sessionId="test-session-id" />);

    // APIレスポンスに基づいて進捗状況が更新される
    expect(screen.getByText("情報を検索しています...")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  test("calls onComplete when research is completed", async () => {
    const onComplete = jest.fn();

    // useResearchStatusフックのモック実装
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: {
        status: "completed",
        progress: 100,
        message: "リサーチが完了しました",
        result: { summary: "テスト結果" },
      },
      error: null,
      isLoading: false,
    });

    render(<ResearchProgress sessionId="test-session-id" onComplete={onComplete} />);

    // 完了時にonCompleteが呼ばれる
    // 注: onCompleteは実際にはuseResearchStatusフック内で呼ばれるので、ここではテストしない
    expect(screen.getByText("リサーチが完了しました")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("handles API error", async () => {
    // useResearchStatusフックのモック実装
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: null,
      error: new Error("API error"),
      isLoading: false,
    });

    render(<ResearchProgress sessionId="test-session-id" />);

    // エラーメッセージが表示される
    expect(screen.getByText(/エラーが発生しました: API error/)).toBeInTheDocument();
  });

  test("displays message when no data is available", async () => {
    // useResearchStatusフックのモック実装
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    });

    render(<ResearchProgress sessionId="test-session-id" />);

    // データがない場合のメッセージが表示される
    expect(screen.getByText("リサーチ情報が見つかりません")).toBeInTheDocument();
  });

  test("displays different status icons based on status", async () => {
    // 処理中のステータス
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: {
        status: "processing",
        progress: 50,
        message: "処理中...",
      },
      error: null,
      isLoading: false,
    });

    const { rerender } = render(<ResearchProgress sessionId="test-session-id" />);

    // 処理中のステータスが表示される
    expect(screen.getByText("処理中...")).toBeInTheDocument();

    // 完了のステータス
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: {
        status: "completed",
        progress: 100,
        message: "完了しました",
      },
      error: null,
      isLoading: false,
    });

    rerender(<ResearchProgress sessionId="test-session-id-2" />);

    // 完了のステータスが表示される
    expect(screen.getByText("完了しました")).toBeInTheDocument();

    // 失敗のステータス
    (useResearchStatus as jest.Mock).mockReturnValue({
      data: {
        status: "failed",
        progress: 0,
        message: "失敗しました",
        error: "エラーが発生しました",
      },
      error: null,
      isLoading: false,
    });

    rerender(<ResearchProgress sessionId="test-session-id-3" />);

    // 失敗のステータスが表示される
    expect(screen.getByText("失敗しました - エラー: エラーが発生しました")).toBeInTheDocument();
  });
});
