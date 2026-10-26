import React from 'react';
import { Link } from 'react-router-dom';

function NoPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-4xl">error_outline</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-text-base mb-3 font-h1">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold text-text-base mb-2">Page Not Found</h2>
      <p className="text-sm text-text-muted max-w-md mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-compli font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NoPage;