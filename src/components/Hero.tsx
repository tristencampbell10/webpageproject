import React from 'react';
import { PERSONAL_INFO } from '../data/portfolioData.ts';
import { ArrowRight, Code2, Layers, Terminal, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section
      id="about"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[260px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-neutral-400">repo:</span>
            <span className="text-white font-medium">{PERSONAL_INFO.handle}/webpageproject</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Building intuitive, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              responsive web projects
            </span>
          </h1>

          {/* Bio paragraph */}
          <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed mb-8 max-w-2xl font-normal">
            Hi, I&apos;m <span className="text-white font-semibold">{PERSONAL_INFO.name}</span>. I develop clean frontend applications, dynamic web pages, and interactive UI components with modern toolchains.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <a
              id="hero-explore-projects-btn"
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:translate-y-[-1px]"
            >
              Explore Projects
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              id="hero-contact-btn"
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 text-sm font-semibold transition-all"
            >
              Contact Me
            </a>

            <a
              id="hero-github-source-btn"
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              <Terminal className="w-4 h-4" />
              github.com/{PERSONAL_INFO.handle}
            </a>
          </div>

          {/* Highlights grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80">
            <div id="stat-card-focus" className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-xs font-mono font-medium">Core Stack</span>
              </div>
              <p className="text-sm font-semibold text-white">React & TypeScript</p>
              <p className="text-xs text-neutral-400 mt-0.5">Vite + Tailwind toolchain</p>
            </div>

            <div id="stat-card-architecture" className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-mono font-medium">Architecture</span>
              </div>
              <p className="text-sm font-semibold text-white">Component Driven</p>
              <p className="text-xs text-neutral-400 mt-0.5">Modular & highly scalable</p>
            </div>

            <div id="stat-card-performance" className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-mono font-medium">Performance</span>
              </div>
              <p className="text-sm font-semibold text-white">Lightning Fast</p>
              <p className="text-xs text-neutral-400 mt-0.5">Vite bundling on Port 3000</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
