import React from 'react';
import { SKILL_CATEGORIES } from '../data/portfolioData.ts';
import { Cpu, CheckCircle } from 'lucide-react';

export const Skills: React.FC = () => {
  return (
    <section id="skills" className="py-20 border-t border-neutral-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono mb-2 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Skills & Technologies
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            A breakdown of technologies, frameworks, and workflows leveraged across web projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SKILL_CATEGORIES.map((category, catIdx) => (
            <div
              key={catIdx}
              id={`skills-category-${catIdx}`}
              className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                <span>{category.title}</span>
                <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md">
                  {category.skills.length} competencies
                </span>
              </h3>

              <div className="space-y-4">
                {category.skills.map((skill, skillIdx) => (
                  <div
                    key={skillIdx}
                    id={`skill-item-${catIdx}-${skillIdx}`}
                    className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/60 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">{skill.name}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {skill.level}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed pl-6">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
