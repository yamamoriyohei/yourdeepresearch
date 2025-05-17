import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ErrorHandler from "@/components/ErrorHandler";

describe("ErrorHandler Component", () => {
  test("renders nothing when no error is provided", () => {
    const { container } = render(<ErrorHandler />);
    expect(container.firstChild).toBeNull();
  });

  test("renders error message when error is provided", () => {
    const error = new Error("Test error message");
    render(<ErrorHandler error={error} />);

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  test("renders custom title and description when provided", () => {
    render(<ErrorHandler title="Custom Error Title" description="Custom error description" />);

    expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
    expect(screen.getByText("Custom error description")).toBeInTheDocument();
  });

  test("renders retry button when showRetry is true", () => {
    const onRetry = jest.fn();
    render(<ErrorHandler error={new Error("Test error")} showRetry={true} onRetry={onRetry} />);

    const retryButton = screen.getByText("再試行");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("does not render retry button when showRetry is false", () => {
    render(<ErrorHandler error={new Error("Test error")} showRetry={false} />);

    expect(screen.queryByText("再試行")).not.toBeInTheDocument();
  });

  test("uses custom retry label when provided", () => {
    render(
      <ErrorHandler
        error={new Error("Test error")}
        showRetry={true}
        retryLabel="カスタムリトライ"
        onRetry={() => {}}
      />
    );

    expect(screen.getByText("カスタムリトライ")).toBeInTheDocument();
  });

  test("uses different variant styles", () => {
    const { rerender } = render(
      <ErrorHandler error={new Error("Test error")} variant="destructive" />
    );

    // destructiveバリアントのスタイルをチェック
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive/50");

    // successバリアントに変更
    rerender(<ErrorHandler error={new Error("Test error")} variant="success" />);

    // successバリアントのスタイルをチェック
    expect(alert).toHaveClass("border-green-500/50");
  });

  test("hides after autoHideAfter milliseconds", async () => {
    jest.useFakeTimers();

    render(<ErrorHandler error={new Error("Test error")} autoHideAfter={1000} />);

    // 最初はエラーメッセージが表示されている
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();

    // 時間を進めるをactでラップ
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // エラーメッセージが非表示になっている
    expect(screen.queryByText("エラーが発生しました")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  test("closes when close button is clicked", () => {
    render(<ErrorHandler error={new Error("Test error")} />);

    // 最初はエラーメッセージが表示されている
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();

    // 閉じるボタンをクリック
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    // エラーメッセージが非表示になっている
    expect(screen.queryByText("エラーが発生しました")).not.toBeInTheDocument();
  });
});
