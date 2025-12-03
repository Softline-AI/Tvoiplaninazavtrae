import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn, LogOut, User } from 'lucide-react';

export const AuthButton: React.FC = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return (
      <div className="px-4 py-2 bg-white/10 rounded-lg animate-pulse">
        <div className="w-20 h-4 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-white text-noir-black rounded-lg font-semibold hover:bg-white/90 transition-all"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </button>
    );
  }

  const displayName = user?.email?.address ||
                      user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4) ||
                      'User';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
        <User className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">{displayName}</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-500 rounded-lg font-medium hover:bg-red-500/30 transition-all border border-red-500/30"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
};
