import React from 'react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-400 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
