import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { authenticated, ready, login } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-noir-dark/40 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
            <p className="text-white/60 mb-6">
              Please sign in to view detailed trader profiles and advanced analytics
            </p>
            <button
              onClick={login}
              className="w-full py-3 px-6 bg-white text-noir-black rounded-lg font-semibold hover:bg-white/90 transition-all"
            >
              Sign In
            </button>
            <p className="text-white/40 text-sm mt-4">
              Connect with email, wallet, or social accounts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
