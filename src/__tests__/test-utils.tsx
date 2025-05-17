import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// テスト用のラッパーコンポーネント
interface AllProvidersProps {
  children: React.ReactNode;
}

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  // テスト用のQueryClientを作成
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// カスタムレンダー関数
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

// テスト用のモックデータ
export const mockResearchData = {
  id: "mock-research-id",
  title: "モックリサーチタイトル",
  content: "モックリサーチの内容です。",
  userId: "mock-user-id",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockProgressData = {
  status: "in_progress",
  progress: 50,
  message: "検索中...",
  result: null,
};

export const mockCompletedProgressData = {
  status: "completed",
  progress: 100,
  message: "完了しました",
  result: {
    title: "モックリサーチタイトル",
    summary: "モックリサーチの要約です。",
    sources: [
      { title: "ソース1", url: "https://example.com/1", content: "ソース1の内容" },
      { title: "ソース2", url: "https://example.com/2", content: "ソース2の内容" },
    ],
  },
};

// re-export testing-libraryの関数
export * from "@testing-library/react";
export { customRender as render };
export { act } from "react";

// テスト用のダミーテスト
describe("Test Utils", () => {
  test("AllProviders renders children", () => {
    const { getByText } = render(<div>Test Child</div>);
    expect(getByText("Test Child")).toBeInTheDocument();
  });
});
