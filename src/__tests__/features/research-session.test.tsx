import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResearchForm from '@/components/ResearchForm';
import '@testing-library/jest-dom';

// モック
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  currentUser: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
}));

// fetchのモック
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/research')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 'test-session-id', message: 'リサーチが開始されました' }),
    });
  }
  return Promise.reject(new Error('Not found'));
});

// useRouterのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('リサーチセッション作成テスト', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  test('リサーチフォームが正しくレンダリングされる', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResearchForm />
      </QueryClientProvider>
    );
    
    // フォームの要素が存在することを確認
    expect(screen.getByPlaceholderText(/リサーチしたいトピックを入力/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /リサーチを開始/i })).toBeInTheDocument();
  });

  test('リサーチリクエストが正しく送信される', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResearchForm />
      </QueryClientProvider>
    );
    
    // フォームに入力
    const input = screen.getByPlaceholderText(/リサーチしたいトピックを入力/i);
    fireEvent.change(input, { target: { value: 'テストクエリ' } });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByRole('button', { name: /リサーチを開始/i });
    fireEvent.click(submitButton);
    
    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/research'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('テストクエリ'),
        })
      );
    });
  });
});
