"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Source {
  url: string;
  title?: string;
}

interface ResearchResultProps {
  id: string;
  topic: string;
  introduction: string;
  sections: Array<{ title: string; content: string; references: string[] }>;
  conclusion: string;
  references: string[];
  createdAt: string;
}

export default function ResearchResults({
  id,
  topic,
  introduction,
  sections,
  conclusion,
  references,
  createdAt,
}: ResearchResultProps) {
  // 日付をフォーマット
  const formattedDate = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="text-sm text-gray-500 mb-2">{formattedDate}に作成</div>
        <CardTitle>{topic}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">はじめに</h3>
          <div className="bg-blue-50 p-4 rounded-md whitespace-pre-line">{introduction}</div>
        </div>

        {sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
            <div className="whitespace-pre-line mb-2">{section.content}</div>
            {section.references.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">参考文献: </span>
                {section.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mr-2"
                  >
                    [{i + 1}]
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div>
          <h3 className="text-lg font-semibold mb-2">結論</h3>
          <div className="whitespace-pre-line">{conclusion}</div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">参考文献</h3>
          <ul className="list-disc pl-5 space-y-1">
            {references.map((ref, index) => (
              <li key={index}>
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Link href="/research">
          <Button variant="outline">新しいリサーチを開始</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
