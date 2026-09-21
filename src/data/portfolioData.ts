import { Project, SkillCategory } from '../types.ts';

export const PERSONAL_INFO = {
  name: 'Tristen Campbell',
  handle: 'tristencampbell10',
  title: 'Frontend Developer & Web Creator',
  bio: 'Building responsive, modern, and interactive web experiences with clean code, modern architecture, and intuitive design.',
  location: 'United States',
  email: 'tristencampbell80@gmail.com',
  github: 'https://github.com/tristencampbell10',
  availableForWork: true,
};

export const PROJECTS: Project[] = [
  {
    id: 'webpage-project',
    title: 'Webpage Project',
    category: 'Web Application',
    description: 'A modern, modular personal webpage and portfolio project built with Vite, React, TypeScript, and Tailwind CSS.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    githubUrl: 'https://github.com/tristencampbell10/webpageproject',
    featured: true,
    stats: [
      { label: 'Bundle Size', value: '< 150 kB' },
      { label: 'Lighthouse', value: '100 Score' },
      { label: 'Port', value: '3000' }
    ],
    details: 'Features fluid animations, responsive layouts, interactive component demos, project showcase modals, and direct contact integration.'
  },
  {
    id: 'photos-album',
    title: 'Photos Album',
    category: 'Gallery / Media',
    description: 'An interactive 3x3 photo album showcasing photography with curated image collections, fullscreen modal inspection, and responsive grid layouts.',
    tags: ['HTML5', 'CSS Grid', 'JavaScript', 'Responsive UI'],
    githubUrl: 'https://github.com/tristencampbell10/photosalbum',
    featured: true,
    stats: [
      { label: 'Layout', value: '3x3 Dynamic Grid' },
      { label: 'Interactions', value: 'Modal Zoom' },
      { label: 'Theme', value: 'Dark Atmosphere' }
    ],
    details: 'Designed with custom radial gradient backdrops, smooth transitions, and equal-dimension photo frames for photography collections.'
  },
  {
    id: 'interactive-showcase',
    title: 'Component Sandbox',
    category: 'Experimental Tool',
    description: 'A real-time interactive UI component sandbox allowing live parameter adjustments, color theme testing, and instant rendering feedback.',
    tags: ['React', 'State Management', 'UI/UX', 'Interactive'],
    featured: false,
    stats: [
      { label: 'Variants', value: 'Live Switcher' },
      { label: 'Performance', value: '60 FPS' }
    ],
    details: 'Demonstrates modern React state lifecycles, accessible controls, and theme tokens in a lightweight sandbox environment.'
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend Development',
    skills: [
      { name: 'React 18+', level: 'Advanced', description: 'Functional components, custom hooks, and modern state architecture.' },
      { name: 'TypeScript', level: 'Intermediate', description: 'Type-safe workflows, strict interfaces, and modular codebases.' },
      { name: 'HTML5 & Semantic Web', level: 'Advanced', description: 'Accessible, clean, and SEO-friendly document structures.' },
      { name: 'Modern CSS & Tailwind', level: 'Advanced', description: 'Utility-first styling, fluid responsiveness, and aesthetic micro-interactions.' }
    ]
  },
  {
    title: 'Tools & Ecosystem',
    skills: [
      { name: 'Vite', level: 'Advanced', description: 'Blazing fast development server and optimized production builds.' },
      { name: 'Git & GitHub', level: 'Intermediate', description: 'Version control, branch workflows, and open-source collaboration.' },
      { name: 'Node.js & npm', level: 'Intermediate', description: 'Package management, script orchestration, and container environments.' },
      { name: 'Motion & Animations', level: 'Intermediate', description: 'Fluid transitions, scroll triggers, and delightful UI dynamics.' }
    ]
  }
];
