import { createJob, getJob, updateJob, deleteJob, executeJob } from "@/lib/jobQueue";

describe("Job Queue", () => {
  // 各テスト後にジョブをクリーンアップ
  afterEach(() => {
    // テスト中に作成されたジョブをクリーンアップ
    const testJobId = "test-job-id";
    deleteJob(testJobId);
  });

  test("createJob should create a new job with pending status", () => {
    const jobId = "test-job-id";
    const job = createJob(jobId);

    expect(job).toBeDefined();
    expect(job.id).toBe(jobId);
    expect(job.status).toBe("pending");
    expect(job.progress).toBe(0);
    expect(job.message).toBe("ジョブを初期化中...");
    expect(job.result).toBeNull();
    expect(job.createdAt).toBeInstanceOf(Date);
    expect(job.updatedAt).toBeInstanceOf(Date);
    expect(job.completedAt).toBeUndefined();
  });

  test("getJob should return the job by id", () => {
    const jobId = "test-job-id";
    createJob(jobId);

    const job = getJob(jobId);

    expect(job).toBeDefined();
    expect(job?.id).toBe(jobId);
  });

  test("getJob should return undefined for non-existent job", () => {
    const job = getJob("non-existent-job");

    expect(job).toBeUndefined();
  });

  test("updateJob should update job properties", () => {
    const jobId = "test-job-id";
    createJob(jobId);

    const updatedJob = updateJob(jobId, {
      status: "processing",
      progress: 50,
      message: "Processing...",
    });

    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe("processing");
    expect(updatedJob?.progress).toBe(50);
    expect(updatedJob?.message).toBe("Processing...");
  });

  test("updateJob should set completedAt when status is completed", () => {
    const jobId = "test-job-id";
    createJob(jobId);

    const updatedJob = updateJob(jobId, {
      status: "completed",
      progress: 100,
      message: "Completed",
    });

    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe("completed");
    expect(updatedJob?.completedAt).toBeInstanceOf(Date);
  });

  test("updateJob should set completedAt when status is failed", () => {
    const jobId = "test-job-id";
    createJob(jobId);

    const updatedJob = updateJob(jobId, {
      status: "failed",
      message: "Failed",
    });

    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe("failed");
    expect(updatedJob?.completedAt).toBeInstanceOf(Date);
  });

  test("updateJob should return undefined for non-existent job", () => {
    const updatedJob = updateJob("non-existent-job", {
      status: "processing",
    });

    expect(updatedJob).toBeUndefined();
  });

  test("deleteJob should remove the job", () => {
    const jobId = "test-job-id";
    createJob(jobId);

    const result = deleteJob(jobId);

    expect(result).toBe(true);
    expect(getJob(jobId)).toBeUndefined();
  });

  test("deleteJob should return false for non-existent job", () => {
    const result = deleteJob("non-existent-job");

    expect(result).toBe(false);
  });

  test("executeJob should execute the task and update job status", async () => {
    const jobId = "test-job-id";

    const mockTask = jest.fn(async (updateProgress) => {
      updateProgress(50, "Half way there");
      return "result";
    });

    const result = await executeJob(jobId, mockTask);

    expect(result).toBe("result");
    expect(mockTask).toHaveBeenCalled();

    const job = getJob(jobId);
    expect(job?.status).toBe("completed");
    expect(job?.progress).toBe(100);
    expect(job?.message).toBe("処理が完了しました");
    expect(job?.result).toBe("result");
  });

  test("executeJob should handle errors and update job status", async () => {
    const jobId = "test-job-id";

    const mockTask = jest.fn(async () => {
      throw new Error("Test error");
    });

    await expect(executeJob(jobId, mockTask)).rejects.toThrow("Test error");

    const job = getJob(jobId);
    expect(job?.status).toBe("failed");
    expect(job?.message).toBe("エラーが発生しました");
    expect(job?.error).toBe("Test error");
  });
});
