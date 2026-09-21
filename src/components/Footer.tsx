import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData.ts';
import { ArrowUp, GitBranch, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="py-12 border-t border-neutral-800 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{PERSONAL_INFO.name}</span>
            <span className="text-xs text-neutral-500 font-mono">/</span>
            <span className="text-xs text-blue-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              webpageproject
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} {PERSONAL_INFO.name}. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            id="footer-github-link"
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>github.com/{PERSONAL_INFO.handle}</span>
          </a>

          <div className="h-3 w-px bg-neutral-800" />

          <button
            id="footer-scroll-top-btn"
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
