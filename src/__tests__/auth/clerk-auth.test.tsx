import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import '@testing-library/jest-dom';

// Clerkのモック
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
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

// テスト用コンポーネント
const TestComponent = () => (
  <ClerkProvider publishableKey="test-key">
    <SignedIn>
      <div>ログイン済みコンテンツ</div>
    </SignedIn>
    <SignedOut>
      <div>未ログインコンテンツ</div>
    </SignedOut>
  </ClerkProvider>
);

describe('Clerk認証テスト', () => {
  test('SignedInコンポーネントが正しくレンダリングされる', async () => {
    render(<TestComponent />);
    
    // SignedInコンポーネントが存在することを確認
    expect(screen.getByTestId('signed-in')).toBeInTheDocument();
    expect(screen.getByText('ログイン済みコンテンツ')).toBeInTheDocument();
  });

  test('SignedOutコンポーネントが正しくレンダリングされる', async () => {
    render(<TestComponent />);
    
    // SignedOutコンポーネントが存在することを確認
    expect(screen.getByTestId('signed-out')).toBeInTheDocument();
    expect(screen.getByText('未ログインコンテンツ')).toBeInTheDocument();
  });
});
