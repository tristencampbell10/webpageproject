import React, { useState, useEffect } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData.ts';
import { GitBranch, Menu, X, Globe, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about', id: 'nav-link-about' },
    { name: 'Projects', href: '#projects', id: 'nav-link-projects' },
    { name: 'Skills', href: '#skills', id: 'nav-link-skills' },
    { name: 'Contact', href: '#contact', id: 'nav-link-contact' },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 shadow-lg shadow-black/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <a
          id="nav-brand-logo"
          href="#"
          className="flex items-center gap-2 text-neutral-100 font-semibold tracking-tight text-lg group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            TC
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-none text-white">{PERSONAL_INFO.name}</span>
            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              webpageproject
            </span>
          </div>
        </a>

        {/* Desktop navigation */}
        <nav id="desktop-nav-menu" className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              id={link.id}
              href={link.href}
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}

          <div className="h-4 w-px bg-neutral-800" />

          <a
            id="nav-github-btn"
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-200 bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 transition-all hover:border-neutral-600"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>GitHub Profile</span>
          </a>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <a
            id="nav-mobile-github-btn"
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-300 bg-neutral-800/60 border border-neutral-700/60"
            aria-label="GitHub Profile"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
          </a>
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-300 bg-neutral-800/60 border border-neutral-700/60 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-xl"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              id={`${link.id}-mobile`}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            id="nav-mobile-full-github"
            href={PERSONAL_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <Globe className="w-4 h-4" />
            View github.com/{PERSONAL_INFO.handle}
          </a>
        </div>
      )}
    </header>
  );
};
