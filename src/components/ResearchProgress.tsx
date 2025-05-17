"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useResearchStatus } from "@/lib/hooks/useResearchStatus";

interface ResearchProgressProps {
  sessionId: string;
  onComplete?: (result: any) => void;
}

export default function ResearchProgress({ sessionId, onComplete }: ResearchProgressProps) {
  // React Queryフックを使用して進捗状況を取得
  const { data: state, error, isLoading } = useResearchStatus(sessionId, onComplete);

  if (isLoading) {
    return <LoadingIndicator progress={0} message="ステータスを取得中..." />;
  }

  if (error) {
    return (
      <LoadingIndicator
        progress={0}
        message={`エラーが発生しました: ${error.message}`}
        variant="error"
        icon="✗"
      />
    );
  }

  if (!state) {
    return <LoadingIndicator progress={0} message="リサーチ情報が見つかりません" />;
  }

  // バリアントを決定
  const getVariant = () => {
    switch (state.status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  // アイコンを決定
  const getIcon = () => {
    switch (state.status) {
      case "completed":
        return "✓";
      case "failed":
        return "✗";
      default:
        return "⟳";
    }
  };

  return (
    <LoadingIndicator
      progress={state.progress}
      message={state.error ? `${state.message} - エラー: ${state.error}` : state.message}
      icon={getIcon()}
      variant={getVariant()}
    />
  );
}
