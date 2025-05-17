"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface InfoCardProps {
  /**
   * カードのタイトル
   */
  title: React.ReactNode;

  /**
   * タイトルの上に表示される小さなテキスト（日付など）
   */
  subtitle?: React.ReactNode;

  /**
   * カード内のメインコンテンツ
   */
  children: React.ReactNode;

  /**
   * カードのフッターに表示するコンテンツ
   */
  footer?: React.ReactNode;

  /**
   * カードの幅
   * @default "w-full"
   */
  className?: string;
}

/**
 * 情報を表示するためのカードコンポーネント
 * タイトル、サブタイトル、コンテンツ、フッターを持ちます
 */
export function InfoCard({
  title,
  subtitle,
  children,
  footer,
  className = "w-full",
}: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {subtitle && <div className="text-sm text-gray-500 mb-2">{subtitle}</div>}
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
