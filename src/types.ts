export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  featured: boolean;
  stats?: { label: string; value: string }[];
  details?: string;
}

export interface SkillCategory {
  title: string;
  skills: {
    name: string;
    level: string;
    description: string;
  }[];
}
