import React, { useState } from 'react';
import { PROJECTS } from '../data/portfolioData.ts';
import { Project } from '../types.ts';
import { ExternalLink, GitBranch, Sparkles, Sliders, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

export const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(PROJECTS[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'interactive'>('all');
  
  // Interactive component sandbox state
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'outline'>('primary');
  const [showBadge, setShowBadge] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<'blue' | 'emerald' | 'purple'>('blue');

  const colorClasses = {
    blue: 'from-blue-600 to-indigo-600 border-blue-500 text-blue-400 bg-blue-500/10',
    emerald: 'from-emerald-600 to-teal-600 border-emerald-500 text-emerald-400 bg-emerald-500/10',
    purple: 'from-purple-600 to-pink-600 border-purple-500 text-purple-400 bg-purple-500/10',
  };

  return (
    <section id="projects" className="py-20 border-t border-neutral-800/80 bg-neutral-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono mb-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Showcase & Work</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Featured Projects
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
              Highlights from my GitHub repositories and interactive web development explorations.
            </p>
          </div>

          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl self-start md:self-auto">
            <button
              id="tab-btn-all"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Repository Projects
            </button>
            <button
              id="tab-btn-interactive"
              onClick={() => setActiveTab('interactive')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Interactive Sandbox
            </button>
          </div>
        </div>

        {activeTab === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className="group relative flex flex-col justify-between bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Stats list */}
                  {project.stats && (
                    <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-xs">
                      {project.stats.map((s, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="text-neutral-500 font-mono">{s.label}</span>
                          <span className="text-neutral-200 font-medium">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800/80 text-neutral-300 border border-neutral-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card actions */}
                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <button
                    id={`view-details-${project.id}`}
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Overview</span>
                  </button>

                  {project.githubUrl && (
                    <a
                      id={`github-link-${project.id}`}
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Interactive UI component sandbox */
          <div id="interactive-sandbox" className="p-6 md:p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Interactive Sandbox Controls</h3>
                  <p className="text-xs text-neutral-400">
                    Test reactive states, layout parameters, and token styles live in real time.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-2 font-mono">
                    Color Accent
                  </label>
                  <div className="flex gap-2">
                    {(['blue', 'emerald', 'purple'] as const).map((color) => (
                      <button
                        key={color}
                        id={`sandbox-color-${color}`}
                        onClick={() => setAccentColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium border transition-all ${
                          accentColor === color
                            ? 'bg-neutral-800 text-white border-blue-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-2 font-mono">
                    Button Variant
                  </label>
                  <div className="flex gap-2">
                    {(['primary', 'secondary', 'outline'] as const).map((v) => (
                      <button
                        key={v}
                        id={`sandbox-variant-${v}`}
                        onClick={() => setButtonVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium border transition-all ${
                          buttonVariant === v
                            ? 'bg-neutral-800 text-white border-blue-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      id="sandbox-badge-toggle"
                      type="checkbox"
                      checked={showBadge}
                      onChange={(e) => setShowBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-neutral-950 border-neutral-700 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 font-medium">Show Status Indicator Badge</span>
                  </label>
                </div>
              </div>

              {/* Live Preview Display */}
              <div className="lg:col-span-7 flex flex-col justify-center items-center p-8 bg-neutral-950/80 rounded-xl border border-neutral-800/80 min-h-[260px]">
                <div className="w-full max-w-sm p-6 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-neutral-400">Component Preview</span>
                    {showBadge && (
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${colorClasses[accentColor]}`}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">Webpage Dynamic Card</h4>
                  <p className="text-xs text-neutral-400 mb-6">
                    This reactive card updates instantaneously with selected state tokens.
                  </p>

                  <div>
                    {buttonVariant === 'primary' && (
                      <button
                        id="sandbox-demo-btn-primary"
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-gradient-to-r shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] ${colorClasses[accentColor]}`}
                      >
                        Action Triggered
                      </button>
                    )}
                    {buttonVariant === 'secondary' && (
                      <button
                        id="sandbox-demo-btn-secondary"
                        className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-neutral-200 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                      >
                        Secondary Action
                      </button>
                    )}
                    {buttonVariant === 'outline' && (
                      <button
                        id="sandbox-demo-btn-outline"
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs border transition-colors ${colorClasses[accentColor]}`}
                      >
                        Outline Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected project detail modal */}
        {selectedProject && (
          <div
            id="project-detail-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  {selectedProject.category}
                </span>
                <button
                  id="modal-close-btn"
                  onClick={() => setSelectedProject(null)}
                  className="text-neutral-400 hover:text-white p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h3>
              <p className="text-sm text-neutral-300 mb-4">{selectedProject.description}</p>
              
              {selectedProject.details && (
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 mb-4 text-xs text-neutral-300 leading-relaxed">
                  <p className="font-semibold text-neutral-200 mb-1">Architecture & Details:</p>
                  {selectedProject.details}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  id="modal-dismiss-btn"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Close
                </button>
                {selectedProject.githubUrl && (
                  <a
                    id="modal-github-btn"
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Open on GitHub</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
