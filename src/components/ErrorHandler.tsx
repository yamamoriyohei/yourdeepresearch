"use client";

import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ErrorHandlerProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
  variant?: "destructive" | "success" | "warning" | "info" | "default";
  title?: string;
  description?: string;
  showRetry?: boolean;
  retryLabel?: string;
  onRetry?: () => void;
  autoHideAfter?: number; // ミリ秒単位
}

export default function ErrorHandler({
  error,
  resetErrorBoundary,
  variant = "destructive",
  title,
  description,
  showRetry = true,
  retryLabel = "再試行",
  onRetry,
  autoHideAfter,
}: ErrorHandlerProps) {
  const [visible, setVisible] = useState(true);

  // エラーメッセージを決定
  const errorTitle = title || (error ? "エラーが発生しました" : "");
  const errorDescription = description || (error ? error.message : "");

  // 自動的に非表示にする
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (autoHideAfter && visible) {
      timer = setTimeout(() => {
        setVisible(false);
      }, autoHideAfter);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoHideAfter, visible]);

  // エラーがない場合や非表示の場合は何も表示しない
  if (!visible || (!error && !title && !description)) {
    return null;
  }

  // 再試行ハンドラー
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    }
  };

  return (
    <Alert variant={variant} className="mb-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 p-0"
        onClick={() => setVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>

      {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
      {errorDescription && <AlertDescription>{errorDescription}</AlertDescription>}

      {showRetry && (onRetry || resetErrorBoundary) && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </Alert>
  );
}
