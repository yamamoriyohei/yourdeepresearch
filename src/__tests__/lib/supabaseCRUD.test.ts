import {
  createUser,
  getUserById,
  updateUserProfile,
  createResearchSession,
  getResearchSessionsByUserId,
  getResearchSessionById,
  updateResearchSession,
  saveResearchResult,
  getResearchResultById,
  saveSources,
} from "@/lib/supabaseCRUD";

import { supabaseClient, supabaseAdmin, TABLES } from "@/lib/supabaseClient";

// jest.setup.jsで定義されたモックを使用する

describe("SupabaseCRUD Functions", () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
  });

  // --- ユーザー関連のテスト ---
  describe("User Operations", () => {
    test("createUser should create a user profile", async () => {
      const userData = {
        username: "testuser",
        avatar_url: "https://example.com/avatar.png",
      };

      // モックを上書き
      supabaseAdmin.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          data: [{ id: "mock-user-id", ...userData }],
          error: null,
        }),
      });

      const result = await createUser("mock-user-id", userData);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLES.USERS);
      expect(result[0]).toEqual({
        id: "mock-user-id",
        username: "testuser",
        avatar_url: "https://example.com/avatar.png",
      });
    });

    test("getUserById should retrieve a user profile", async () => {
      // モックを上書き
      supabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: {
                id: "mock-user-id",
                username: "testuser",
                avatar_url: "https://example.com/avatar.png",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserById("mock-user-id");

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.USERS);
      expect(result).toEqual({
        id: "mock-user-id",
        username: "testuser",
        avatar_url: "https://example.com/avatar.png",
      });
    });

    test("updateUserProfile should update a user profile", async () => {
      const updates = {
        username: "updateduser",
        avatar_url: "https://example.com/new-avatar.png",
      };

      // モックを上書き
      supabaseClient.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              data: [{ id: "mock-user-id", ...updates }],
              error: null,
            }),
          }),
        }),
      });

      const result = await updateUserProfile("mock-user-id", updates);

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.USERS);
    });
  });

  // --- リサーチセッション関連のテスト ---
  describe("Research Session Operations", () => {
    test("createResearchSession should create a session", async () => {
      const sessionData = {
        user_id: "mock-user-id",
        query: "test query",
        status: "processing" as const,
        created_at: "2023-01-01T00:00:00Z",
      };

      // モックを上書き
      supabaseClient.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: [{ id: "mock-session-id", ...sessionData }],
            error: null,
          }),
        }),
      });

      const result = await createResearchSession(sessionData);

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_SESSIONS);
    });

    test("getResearchSessionsByUserId should retrieve sessions for a user", async () => {
      // モックを上書き
      const mockSessions = [
        {
          id: "mock-research_sessions-id-1",
          user_id: "mock-user-id",
          query: "test query 1",
          status: "processing",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T01:00:00Z",
        },
        {
          id: "mock-research_sessions-id-2",
          user_id: "mock-user-id",
          query: "test query 2",
          status: "completed",
          created_at: "2023-01-02T00:00:00Z",
          updated_at: "2023-01-02T01:00:00Z",
        },
      ];

      supabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              data: mockSessions,
              error: null,
            }),
          }),
        }),
      });

      const result = await getResearchSessionsByUserId("mock-user-id");

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_SESSIONS);
    });

    test("getResearchSessionById should retrieve a session with its results", async () => {
      // モックを上書き
      const mockSession = {
        id: "mock-session-id",
        user_id: "mock-user-id",
        query: "test query",
        status: "completed",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T01:00:00Z",
        research_results: [
          {
            id: "mock-result-id",
            session_id: "mock-session-id",
            summary: "test summary",
            details: "test details",
            related_topics: ["topic1", "topic2"],
            created_at: "2023-01-01T01:00:00Z",
          },
        ],
      };

      supabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockSession,
              error: null,
            }),
          }),
        }),
      });

      const result = await getResearchSessionById("mock-session-id");

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_SESSIONS);
    });

    test("updateResearchSession should update a session status", async () => {
      const updates = {
        status: "completed" as const,
      };

      // モックを上書き
      supabaseClient.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              data: [
                {
                  id: "mock-session-id",
                  status: "completed",
                  updated_at: "2023-01-01T01:00:00Z",
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await updateResearchSession("mock-session-id", updates);

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_SESSIONS);
    });
  });

  // --- リサーチ結果関連のテスト ---
  describe("Research Result Operations", () => {
    test("saveResearchResult should save a result", async () => {
      const resultData = {
        session_id: "mock-session-id",
        summary: "test summary",
        details: "test details",
        related_topics: ["topic1", "topic2"],
        created_at: "2023-01-01T01:00:00Z",
      };

      // モックを上書き
      supabaseClient.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: [{ id: "mock-result-id", ...resultData }],
            error: null,
          }),
        }),
      });

      const result = await saveResearchResult(resultData);

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_RESULTS);
      expect(result).toEqual({
        id: "mock-result-id",
        ...resultData,
      });
    });

    test("getResearchResultById should retrieve a result with its sources", async () => {
      // モックを上書き
      const mockResult = {
        id: "mock-result-id",
        session_id: "mock-session-id",
        summary: "test summary",
        details: "test details",
        related_topics: ["topic1", "topic2"],
        created_at: "2023-01-01T01:00:00Z",
        sources: [
          {
            id: "mock-source-id",
            research_result_id: "mock-result-id",
            url: "https://example.com",
            title: "Example Source",
          },
        ],
      };

      supabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue({
              data: mockResult,
              error: null,
            }),
          }),
        }),
      });

      const result = await getResearchResultById("mock-result-id");

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.RESEARCH_RESULTS);
      expect(result).toEqual(mockResult);
    });
  });

  // --- ソース関連のテスト ---
  describe("Source Operations", () => {
    test("saveSources should save multiple sources", async () => {
      const sourcesData = [
        {
          research_result_id: "mock-result-id",
          url: "https://example1.com",
          title: "Example Source 1",
        },
        {
          research_result_id: "mock-result-id",
          url: "https://example2.com",
          title: "Example Source 2",
        },
      ];

      // モックを上書き
      const mockSourcesWithIds = sourcesData.map((source, index) => ({
        ...source,
        id: `mock-source-id-${index + 1}`,
      }));

      supabaseClient.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            data: mockSourcesWithIds,
            error: null,
          }),
        }),
      });

      const result = await saveSources(sourcesData);

      expect(supabaseClient.from).toHaveBeenCalledWith(TABLES.SOURCES);
      expect(result).toEqual(mockSourcesWithIds);
    });
  });

  // --- エラーハンドリングのテスト ---
  describe("Error Handling", () => {
    test("should throw error when Supabase operation fails", async () => {
      // エラーを発生させるためにsupabaseClientのfromメソッドを一時的に上書き
      const originalFrom = supabaseClient.from;
      supabaseClient.from = jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: null,
              error: new Error("Database error"),
            })),
          })),
        })),
      }));

      await expect(getUserById("mock-user-id")).rejects.toThrow();

      // モックを元に戻す
      supabaseClient.from = originalFrom;
    });
  });
});
