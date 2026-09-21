import React from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { Projects } from './components/Projects.tsx';
import { Skills } from './components/Skills.tsx';
import { Contact } from './components/Contact.tsx';
import { Footer } from './components/Footer.tsx';

export default function App(): React.ReactElement {
  return (
    <div id="app-root" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
