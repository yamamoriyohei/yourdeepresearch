import React from "react";
import { render, screen } from "../test-utils";
import ResearchResults from "@/components/ResearchResults";

// モックデータ
const mockData = {
  id: "test-id-123",
  topic: "テストトピック",
  introduction: "これはテストの導入部です。",
  sections: [
    {
      title: "セクション1",
      content: "これはセクション1の内容です。",
      references: ["https://example.com/1", "https://example.com/2"],
    },
    {
      title: "セクション2",
      content: "これはセクション2の内容です。",
      references: [],
    },
  ],
  conclusion: "これはテストの結論です。",
  references: ["https://example.com/ref1", "https://example.com/ref2", "https://example.com/ref3"],
  createdAt: "2023-05-14T10:30:00Z",
};

// Linkコンポーネントのモック
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("ResearchResults Component", () => {
  test("renders topic and creation date correctly", () => {
    render(<ResearchResults {...mockData} />);

    // トピックが表示されるか確認
    expect(screen.getByText("テストトピック")).toBeInTheDocument();

    // 作成日が表示されるか確認（日本語表記のため部分マッチング）
    const dateRegex = /\d{4}年\d{1,2}月\d{1,2}日.+に作成/;
    const dateElement = screen.getByText(dateRegex);
    expect(dateElement).toBeInTheDocument();
  });

  test("renders introduction section correctly", () => {
    render(<ResearchResults {...mockData} />);

    expect(screen.getByText("はじめに")).toBeInTheDocument();
    expect(screen.getByText("これはテストの導入部です。")).toBeInTheDocument();
  });

  test("renders all content sections correctly", () => {
    render(<ResearchResults {...mockData} />);

    // セクション1が表示されるか確認
    expect(screen.getByText("セクション1")).toBeInTheDocument();
    expect(screen.getByText("これはセクション1の内容です。")).toBeInTheDocument();

    // セクション1の参考文献が表示されるか確認
    expect(screen.getByText("参考文献:")).toBeInTheDocument();
    expect(screen.getByText("[1]")).toBeInTheDocument();
    expect(screen.getByText("[2]")).toBeInTheDocument();

    // セクション2が表示されるか確認
    expect(screen.getByText("セクション2")).toBeInTheDocument();
    expect(screen.getByText("これはセクション2の内容です。")).toBeInTheDocument();
  });

  test("renders conclusion section correctly", () => {
    render(<ResearchResults {...mockData} />);

    expect(screen.getByText("結論")).toBeInTheDocument();
    expect(screen.getByText("これはテストの結論です。")).toBeInTheDocument();
  });

  test("renders references list correctly", () => {
    render(<ResearchResults {...mockData} />);

    // 参考文献セクションヘッダーが表示されるか確認
    expect(screen.getByText("参考文献")).toBeInTheDocument();

    // すべての参考文献URLが表示されるか確認
    const refLinks = screen.getAllByRole("link");

    // リンクの数を確認（セクション1の2つ + 参考文献一覧の3つ + 「新しいリサーチを開始」ボタン = 6）
    expect(refLinks.length).toBe(6);

    // 特定のリンクが存在するか確認
    const refUrls = refLinks.map((link) => link.getAttribute("href"));
    expect(refUrls).toContain("https://example.com/ref1");
    expect(refUrls).toContain("https://example.com/ref2");
    expect(refUrls).toContain("https://example.com/ref3");
  });

  test('renders "new research" button with correct link', () => {
    render(<ResearchResults {...mockData} />);

    const newResearchButton = screen.getByRole("link", { name: "新しいリサーチを開始" });
    expect(newResearchButton).toBeInTheDocument();
    expect(newResearchButton).toHaveAttribute("href", "/research");
  });

  test("handles sections with no references correctly", () => {
    render(<ResearchResults {...mockData} />);

    // セクション2には参考文献が表示されないことを確認
    // セクション2の内容の後に「参考文献:」テキストがないことを確認
    const section2Content = screen.getByText("これはセクション2の内容です。");
    const section2Div = section2Content.parentElement;

    // 「参考文献:」テキストの数を数える
    const refLabels = screen.getAllByText("参考文献:");
    expect(refLabels.length).toBe(1); // セクション1にのみ存在
  });
});
