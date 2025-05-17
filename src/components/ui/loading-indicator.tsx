"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  /**
   * 進行状況を0-100の数値で表します
   */
  progress?: number;

  /**
   * 表示するメッセージ
   */
  message?: string;

  /**
   * 表示するアイコン（絵文字やテキスト）
   */
  icon?: React.ReactNode;

  /**
   * スタイルバリアント
   */
  variant?: "default" | "success" | "error" | "warning";
}

/**
 * ローディング状態を表示するための共通コンポーネント
 * プログレスバーとメッセージを表示し、状態に応じて色を変えることができます
 */
export function LoadingIndicator({
  progress = 0,
  message = "ロード中...",
  icon = "⟳",
  variant = "default",
}: LoadingIndicatorProps) {
  // バリアントに応じたスタイルを設定
  const getVariantStyle = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 border-green-300 text-green-800";
      case "error":
        return "bg-red-100 border-red-300 text-red-800";
      case "warning":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default:
        return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className={`p-4 rounded-md border ${getVariantStyle()}`}>
        <div className="flex items-center">
          <span className="mr-2 text-xl">{icon}</span>
          <span className="font-medium">{message}</span>
        </div>
      </div>

      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進捗状況</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
