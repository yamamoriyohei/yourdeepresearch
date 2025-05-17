/**
 * シンプルなジョブキューの実装
 * 実際の本番環境では、Redis、Bull.js、またはAWS SQSなどの堅牢なキューイングシステムを使用することをお勧めします
 */

interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  result: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// メモリ内ジョブストア
const jobs = new Map<string, Job>();

// ジョブの作成
export function createJob(id: string): Job {
  const job: Job = {
    id,
    status: "pending",
    progress: 0,
    message: "ジョブを初期化中...",
    result: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(id, job);
  return job;
}

// ジョブの取得
export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

// ジョブの更新
export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = jobs.get(id);

  if (!job) {
    return undefined;
  }

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: new Date(),
  };

  // 完了または失敗した場合は完了時間を設定
  if (updates.status === "completed" || updates.status === "failed") {
    updatedJob.completedAt = new Date();
  }

  jobs.set(id, updatedJob);
  return updatedJob;
}

// ジョブの削除（古いジョブのクリーンアップなどに使用）
export function deleteJob(id: string): boolean {
  return jobs.delete(id);
}

// ジョブの実行
export async function executeJob<T>(
  id: string,
  task: (updateProgress: (progress: number, message: string) => void) => Promise<T>
): Promise<T> {
  // ジョブが存在しない場合は作成
  if (!jobs.has(id)) {
    createJob(id);
  }

  // ジョブのステータスを処理中に更新
  updateJob(id, {
    status: "processing",
    progress: 0,
    message: "処理を開始しています...",
  });

  // 進捗更新用の関数
  const updateProgress = (progress: number, message: string) => {
    updateJob(id, { progress, message });
  };

  try {
    // タスクを実行
    const result = await task(updateProgress);

    // ジョブを完了としてマーク
    updateJob(id, {
      status: "completed",
      progress: 100,
      message: "処理が完了しました",
      result,
    });

    return result;
  } catch (error: any) {
    // エラー発生時
    updateJob(id, {
      status: "failed",
      message: "エラーが発生しました",
      error: error.message || "不明なエラー",
    });

    throw error;
  }
}

// 古いジョブのクリーンアップ（定期的に実行する必要があります）
export function cleanupOldJobs(maxAgeInHours: number = 24): void {
  const now = new Date();
  const maxAge = maxAgeInHours * 60 * 60 * 1000; // ミリ秒に変換

  jobs.forEach((job, id) => {
    const jobAge = now.getTime() - job.createdAt.getTime();

    if (jobAge > maxAge) {
      jobs.delete(id);
    }
  });
}

// 定期的なクリーンアップの設定（サーバーサイドでのみ実行）
if (typeof window === "undefined") {
  // 6時間ごとにクリーンアップを実行
  setInterval(
    () => {
      cleanupOldJobs();
    },
    6 * 60 * 60 * 1000
  );
}
