// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Deep Research Agent",
  description: "Your personal AI research assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="font-sans">
          <Providers>
            <header className="p-4 border-b">
              <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                  Deep Research Agent
                </Link>
                <div>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                    <Link href="/dashboard" className="ml-4 text-blue-600 hover:underline">
                      Dashboard
                    </Link>
                    <Link href="/research" className="ml-4 text-blue-600 hover:underline">
                      New Research
                    </Link>
                  </SignedIn>
                </div>
              </nav>
            </header>
            <main className="container mx-auto p-4">{children}</main>
            <footer className="p-4 border-t mt-8 text-center text-gray-600">
              <p>&copy; 2025 Your Deep Research Agent. All rights reserved.</p>
            </footer>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
