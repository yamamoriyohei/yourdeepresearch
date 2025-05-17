import { NextRequest } from 'next/server';
import { POST } from '@/app/api/research/route';
import { GET } from '@/app/api/research/history/route';

// モック
jest.mock('@clerk/nextjs', () => ({
  currentUser: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
  auth: jest.fn().mockReturnValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}));

jest.mock('@/lib/supabaseCRUD', () => ({
  createResearchSession: jest.fn().mockResolvedValue({
    id: 'test-session-id',
    user_id: 'test-user-id',
    query: 'テストクエリ',
    status: 'processing',
    created_at: '2023-01-01T00:00:00Z',
  }),
  getResearchSessionsByUserId: jest.fn().mockResolvedValue([
    {
      id: 'session-1',
      user_id: 'test-user-id',
      query: 'テストクエリ1',
      status: 'completed',
      created_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 'session-2',
      user_id: 'test-user-id',
      query: 'テストクエリ2',
      status: 'processing',
      created_at: '2023-01-02T00:00:00Z',
    },
  ]),
  updateResearchSession: jest.fn().mockResolvedValue({
    id: 'test-session-id',
    user_id: 'test-user-id',
    query: 'テストクエリ',
    status: 'completed',
    created_at: '2023-01-01T00:00:00Z',
  }),
  saveResearchResult: jest.fn().mockResolvedValue({
    id: 'test-result-id',
    session_id: 'test-session-id',
    summary: 'テスト要約',
    details: 'テスト詳細',
    related_topics: ['トピック1', 'トピック2'],
    created_at: '2023-01-01T00:00:00Z',
  }),
  saveSources: jest.fn().mockResolvedValue([
    {
      id: 'source-1',
      research_result_id: 'test-result-id',
      url: 'https://example.com/1',
      title: 'ソース1',
      created_at: '2023-01-01T00:00:00Z',
    },
  ]),
}));

jest.mock('@/lib/openDeepResearch', () => ({
  performResearch: jest.fn().mockResolvedValue({
    summary: 'テスト要約',
    details: 'テスト詳細',
    sources: ['https://example.com/1'],
    relatedTopics: ['トピック1', 'トピック2'],
  }),
}));

jest.mock('@/lib/jobQueue', () => ({
  createJob: jest.fn(),
  executeJob: jest.fn().mockImplementation((id, callback) => {
    callback(jest.fn());
    return Promise.resolve();
  }),
}));

describe('リサーチAPIテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/research が正しく動作する', async () => {
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'テストクエリ',
        maxDepth: 3,
        includeSourceLinks: true,
      }),
    });

    // APIエンドポイントの呼び出し
    const response = await POST(req);
    const data = await response.json();

    // レスポンスの検証
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id', 'test-session-id');
    expect(data).toHaveProperty('message', 'リサーチが開始されました');
  });

  test('GET /api/research/history が正しく動作する', async () => {
    // リクエストの作成
    const req = new NextRequest('http://localhost:3000/api/research/history');

    // APIエンドポイントの呼び出し
    const response = await GET(req);
    const data = await response.json();

    // レスポンスの検証
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('id', 'session-1');
    expect(data[1]).toHaveProperty('id', 'session-2');
  });
});
