import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { TOKENS } from '../constants/tokens';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const { data: usdcBalance } = useBalance({
    address,
    token: TOKENS[0].address, // USDC
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Token Transfer App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                USDC Balance: {usdcBalance?.formatted ?? "0"}
              </div>
              <div className="text-sm text-gray-500">
                {address ? (
                  <span className="font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                ) : (
                  "Not Connected"
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center w-full px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md w-full mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with ❤️ using Next.js, Wagmi, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
} 