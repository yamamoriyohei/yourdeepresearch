// jest.setup.js
// このファイルはJestのテスト実行前に実行されます

// Testing Libraryのカスタムマッチャーを追加
import '@testing-library/jest-dom';

// グローバルなモックの設定
global.fetch = jest.fn();

// Next.jsのRequestとResponseのモック
jest.mock('next/server', () => {
  // グローバルにRequestを設定
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Headers(options.headers || {});
      this.body = options.body;
    }

    async json() {
      return JSON.parse(this.body || '{}');
    }
  };

  // グローバルにResponseを設定
  global.Response = class Response {
    constructor(body, options = {}) {
      this.body = typeof body === 'string' ? body : JSON.stringify(body);
      this.status = options.status || 200;
      this.statusText = options.statusText || '';
      this.headers = new Headers(options.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this.body || '{}');
    }
  };

  // NextRequestとNextResponseのモック
  class NextRequest extends global.Request {
    constructor(input, init = {}) {
      super(input, init);
      this.nextUrl = new URL(typeof input === 'string' ? input : input.url);
    }
  }

  class NextResponse extends global.Response {
    constructor(body, init = {}) {
      super(body, init);
    }

    static json(body, init = {}) {
      return new NextResponse(
        body,
        {
          ...init,
          headers: {
            ...init?.headers,
            'content-type': 'application/json',
          },
        }
      );
    }
  }

  return {
    NextRequest,
    NextResponse,
  };
});

// Headersクラスのモック
global.Headers = class Headers {
  constructor(init = {}) {
    this.headers = { ...init };
  }

  append(name, value) {
    this.headers[name] = value;
  }

  delete(name) {
    delete this.headers[name];
  }

  get(name) {
    return this.headers[name];
  }

  has(name) {
    return name in this.headers;
  }

  set(name, value) {
    this.headers[name] = value;
  }
};

// 環境変数のモック
process.env = {
  ...process.env,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'mock_clerk_publishable_key',
  CLERK_SECRET_KEY: 'mock_clerk_secret_key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock_supabase_anon_key',
  SUPABASE_SERVICE_ROLE_KEY: 'mock_supabase_service_role_key',
  OPENAI_API_KEY: 'mock_openai_api_key',
  PINECONE_API_KEY: 'mock_pinecone_api_key',
  PINECONE_ENVIRONMENT: 'mock_pinecone_environment',
  PINECONE_INDEX_NAME: 'mock_pinecone_index',
  TAVILY_API_KEY: 'mock_tavily_api_key',
};

// Next.jsのルーターのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/mock-path',
  useSearchParams: () => ({
    get: jest.fn().mockImplementation(param => {
      if (param === 'id') return 'mock-id';
      return null;
    }),
  }),
  redirect: jest.fn(),
}));

// Clerkのモック
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({
    userId: 'mock_user_id',
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
  currentUser: () => ({
    id: 'mock_user_id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'mock_user_id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  ClerkProvider: ({ children }) => children,
  SignIn: () => <div>SignIn</div>,
  SignUp: () => <div>SignUp</div>,
  UserButton: () => <div>UserButton</div>,
}));

// OpenAIのモック
jest.mock('@/lib/openai', () => {
  // 1536次元のモック埋め込みベクトルを生成
  const mockEmbedding = Array(1536).fill(0).map((_, i) => 0.1 + (i * 0.0001));

  // OpenAIインスタンスのモック
  const mockOpenAIInstance = {
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      }),
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }],
        }),
      },
    },
  };

  // グローバル変数にモックを設定
  global.__mocks__ = global.__mocks__ || {};
  global.__mocks__.openai = mockOpenAIInstance;

  // generateWithOpenAIのモック実装
  const generateWithOpenAI = jest.fn().mockImplementation((prompt) => {
    // エラーテスト用
    if (prompt === 'error_test') {
      return Promise.resolve(null);
    }

    // APIキーの有無に関わらず同じレスポンスを返す
    return Promise.resolve('This is a mock response from OpenAI');
  });

  // getEmbeddingのモック実装
  const getEmbedding = jest.fn().mockImplementation(async (text) => {
    try {
      // テキストが長すぎる場合のテスト用
      if (text.length > 8000) {
        const truncatedText = text.substring(0, 8000);
        await mockOpenAIInstance.embeddings.create({
          model: 'text-embedding-ada-002',
          input: truncatedText,
        });
        return mockEmbedding;
      }

      await mockOpenAIInstance.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return mockEmbedding;
    } catch (error) {
      console.error('Error in getEmbedding mock:', error);
      throw error;
    }
  });

  // getChatCompletionのモック実装
  const getChatCompletion = jest.fn().mockImplementation(async (messages, options = {}) => {
    return 'Mock response';
  });

  return {
    getEmbedding,
    getChatCompletion,
    generateWithOpenAI,
  };
});

// Tavilyのモック - APIのみで使用するため、直接関数をモック化
jest.mock('@/lib/tavily', () => ({
  searchWeb: jest.fn().mockResolvedValue([
    {
      title: 'Mock Title',
      url: 'https://example.com',
      content: 'Mock Content',
      score: 0.95,
    },
  ]),
}));

// Supabaseのモック
jest.mock('@/lib/supabaseClient', () => {
  // モックの共通関数
  const mockSupabaseResponse = (mockData) => ({
    data: mockData,
    error: null,
  });

  // テーブルネームの定義
  const TABLES = {
    USERS: "users",
    RESEARCH_SESSIONS: "research_sessions",
    RESEARCH_RESULTS: "research_results",
    SOURCES: "sources",
  };

  // モックデータを返す関数
  const getMockData = (table, id) => {
    switch (table) {
      case TABLES.USERS:
        return { id: id || 'mock-user-id', username: 'testuser', avatar_url: 'https://example.com/avatar.png' };
      case TABLES.RESEARCH_SESSIONS:
        return {
          id: id || 'mock-session-id',
          user_id: 'mock-user-id',
          query: 'test query',
          status: 'completed',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T01:00:00Z',
        };
      case TABLES.RESEARCH_RESULTS:
        return {
          id: id || 'mock-result-id',
          session_id: 'mock-session-id',
          summary: 'test summary',
          details: 'test details',
          related_topics: ['topic1', 'topic2'],
          created_at: '2023-01-01T01:00:00Z',
        };
      default:
        return { id: id || 'mock-id' };
    }
  };

  // モックデータリストを返す関数
  const getMockDataList = (table, column, value) => {
    if (column && value) {
      // 特定の条件に一致するデータのリスト
      return [1, 2, 3].map(i => ({
        id: `mock-${table}-id-${i}`,
        ...(table === TABLES.RESEARCH_SESSIONS && {
          user_id: value,
          query: `test query ${i}`,
          status: i % 2 === 0 ? 'completed' : 'processing',
          created_at: `2023-01-0${i}T00:00:00Z`,
          updated_at: `2023-01-0${i}T01:00:00Z`,
        }),
      }));
    }

    // すべてのデータのリスト
    return [1, 2, 3].map(i => ({
      id: `mock-${table}-id-${i}`,
      ...(table === TABLES.RESEARCH_SESSIONS && {
        user_id: 'mock-user-id',
        query: `test query ${i}`,
        status: i % 2 === 0 ? 'completed' : 'processing',
        created_at: `2023-01-0${i}T00:00:00Z`,
        updated_at: `2023-01-0${i}T01:00:00Z`,
      }),
    }));
  };

  // モック関数を作成
  const mockSelectFn = jest.fn().mockImplementation(() => {
    const mockSelectObj = {
      eq: jest.fn().mockImplementation((column, value) => {
        const mockEqObj = {
          single: jest.fn().mockReturnValue(mockSupabaseResponse(getMockData(TABLES.USERS, value))),
          order: jest.fn().mockReturnValue(mockSupabaseResponse(getMockDataList(TABLES.USERS, column, value))),
          select: jest.fn().mockReturnValue(mockSupabaseResponse([getMockData(TABLES.USERS, value)])),
        };
        return mockEqObj;
      }),
      order: jest.fn().mockReturnValue(mockSupabaseResponse(getMockDataList(TABLES.USERS))),
    };
    return mockSelectObj;
  });

  const mockInsertFn = jest.fn().mockImplementation((data) => {
    const mockInsertObj = {
      select: jest.fn().mockReturnValue(mockSupabaseResponse([{ id: 'mock-id', ...data[0] }])),
    };
    return mockInsertObj;
  });

  const mockUpdateFn = jest.fn().mockImplementation((updates) => {
    const mockUpdateObj = {
      eq: jest.fn().mockImplementation((column, value) => {
        const mockEqObj = {
          select: jest.fn().mockReturnValue(mockSupabaseResponse([{ id: value, ...updates }])),
        };
        return mockEqObj;
      }),
    };
    return mockUpdateObj;
  });

  // supabaseClientのモック
  const mockSupabaseClient = {
    from: jest.fn().mockImplementation((table) => {
      const mockFromObj = {
        select: mockSelectFn,
        insert: mockInsertFn,
        update: mockUpdateFn,
      };
      return mockFromObj;
    }),
  };

  // supabaseAdminのモック
  const mockSupabaseAdmin = {
    from: jest.fn().mockImplementation((table) => {
      const mockFromObj = {
        insert: jest.fn().mockImplementation((data) => mockSupabaseResponse(data)),
      };
      return mockFromObj;
    }),
  };

  return {
    supabaseClient: mockSupabaseClient,
    supabaseAdmin: mockSupabaseAdmin,
    TABLES,
  };
});

// Pineconeのモック
jest.mock('@/lib/pineconeClient', () => {
  // モック関数
  const mockUpsert = jest.fn().mockResolvedValue({ upsertedCount: 1 });
  const mockQuery = jest.fn().mockResolvedValue({
    matches: [
      { id: 'mock-vector-id', score: 0.95, metadata: { text: 'Mock vector text' } },
    ],
  });

  // モックインデックス
  const mockIndex = {
    upsert: mockUpsert,
    query: mockQuery,
  };

  // モックPineconeクライアント
  const mockPinecone = {
    index: jest.fn().mockReturnValue(mockIndex),
  };

  // モジュールのエクスポート
  const moduleExports = {
    pinecone: mockPinecone,
    index: mockIndex,
  };

  // テストでアクセスできるように、グローバル変数にも設定
  global.__mocks__ = global.__mocks__ || {};
  global.__mocks__.pineconeClient = moduleExports;

  return moduleExports;
});

// ResizeObserverのモック（UIコンポーネントのテストに必要）
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// React Queryのモック
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query');

  // モッククエリークライアント
  const mockQueryClient = {
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    prefetchQuery: jest.fn(),
    getQueryCache: jest.fn(),
    resetQueries: jest.fn(),
    isFetching: jest.fn().mockReturnValue(false),
  };

  // モッククエリー結果
  const mockQueryResult = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isFetching: false,
    refetch: jest.fn(),
  };

  return {
    ...originalModule,
    QueryClient: jest.fn().mockImplementation(() => mockQueryClient),
    QueryClientProvider: ({ children }) => children,
    useQuery: jest.fn().mockImplementation(() => mockQueryResult),
    useMutation: jest.fn().mockImplementation(() => ({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      data: undefined,
      reset: jest.fn(),
    })),
  };
});

// JobQueueのモック
jest.mock('@/lib/jobQueue', () => {
  // ジョブデータを保持するオブジェクト
  const jobs = {};

  // ジョブ作成関数
  const createJob = jest.fn().mockImplementation((id) => {
    const job = {
      id,
      status: 'pending',
      progress: 0,
      message: 'ジョブを初期化中...',
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined,
    };
    jobs[id] = job;
    return job;
  });

  // ジョブ取得関数
  const getJob = jest.fn().mockImplementation((id) => {
    if (id === 'non-existent-job') return undefined;
    return jobs[id];
  });

  // ジョブ更新関数
  const updateJob = jest.fn().mockImplementation((id, updates) => {
    if (id === 'non-existent-job') return undefined;
    if (!jobs[id]) return undefined;

    const job = jobs[id];
    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    // 完了または失敗の場合は完了時間を設定
    if (updates.status === 'completed' || updates.status === 'failed') {
      updatedJob.completedAt = new Date();
    }

    jobs[id] = updatedJob;
    return updatedJob;
  });

  // ジョブ削除関数
  const deleteJob = jest.fn().mockImplementation((id) => {
    if (id === 'non-existent-job') return false;
    if (!jobs[id]) return false;

    delete jobs[id];
    return true;
  });

  // ジョブ実行関数
  const executeJob = jest.fn().mockImplementation(async (id, task) => {
    // テスト用にジョブを作成
    if (!jobs[id]) {
      createJob(id);
    }

    // エラーテスト用
    if (id === 'error-job') {
      updateJob(id, {
        status: 'failed',
        message: 'エラーが発生しました',
        error: 'Test error',
      });
      throw new Error('Test error');
    }

    try {
      // タスクの実行と進捗更新関数の提供
      const updateProgress = (progress, message) => {
        updateJob(id, { progress, message });
      };

      const result = await task(updateProgress);

      // 成功時のジョブ更新
      updateJob(id, {
        status: 'completed',
        progress: 100,
        message: '処理が完了しました',
        result,
      });

      return result;
    } catch (error) {
      // エラー時のジョブ更新
      updateJob(id, {
        status: 'failed',
        message: 'エラーが発生しました',
        error: error.message,
      });
      throw error;
    }
  });

  return {
    addJob: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    getJobStatus: jest.fn().mockResolvedValue({ status: 'completed', result: { data: 'Mock result' } }),
    updateJobStatus: jest.fn().mockResolvedValue(true),
    createJob,
    getJob,
    updateJob,
    deleteJob,
    executeJob,
  };
});
