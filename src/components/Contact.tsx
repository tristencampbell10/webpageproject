import React, { useState } from 'react';
import { PERSONAL_INFO } from '../data/portfolioData.ts';
import { Mail, MapPin, GitBranch, Send, Check, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 border-t border-neutral-800/80 bg-neutral-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono mb-2 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Connect</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Get in Touch
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            Interested in collaborating, discussing frontend projects, or exploring repository code? Feel free to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Details</h3>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-neutral-400">Email Address</p>
                  <a
                    id="contact-email-link"
                    href={`mailto:${PERSONAL_INFO.email}`}
                    className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {PERSONAL_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-neutral-400">GitHub Profile</p>
                  <a
                    id="contact-github-link"
                    href={PERSONAL_INFO.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    github.com/{PERSONAL_INFO.handle}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-neutral-400">Location</p>
                  <p className="text-sm font-semibold text-white">{PERSONAL_INFO.location}</p>
                </div>
              </div>
            </div>

            {/* Quick action card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 to-indigo-950/30 border border-blue-900/40">
              <h4 className="text-sm font-bold text-blue-200 mb-1">Direct Mail Client</h4>
              <p className="text-xs text-neutral-400 mb-4">
                Prefer sending via your default desktop or mobile mail app?
              </p>
              <a
                id="contact-mailto-btn"
                href={`mailto:${PERSONAL_INFO.email}?subject=Hello%20from%20Webpage%20Project`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Open Mail Application</span>
              </a>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800">
              {submitted ? (
                <div id="contact-success-state" className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Prepared!</h3>
                  <p className="text-sm text-neutral-300 max-w-md mx-auto">
                    Thank you, <span className="font-semibold text-white">{formState.name}</span>. Your inquiry note has been captured.
                  </p>
                  <button
                    id="contact-reset-form-btn"
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: '', email: '', message: '' });
                    }}
                    className="text-xs font-semibold text-blue-400 hover:underline pt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-2">Send a Message</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name-input" className="text-xs font-mono text-neutral-300 block mb-1.5">
                        Your Name
                      </label>
                      <input
                        id="contact-name-input"
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="Tristen Campbell"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email-input" className="text-xs font-mono text-neutral-300 block mb-1.5">
                        Your Email
                      </label>
                      <input
                        id="contact-email-input"
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message-input" className="text-xs font-mono text-neutral-300 block mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="contact-message-input"
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Hi Tristen, I saw your webpage project repository..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    id="contact-submit-btn"
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:translate-y-[-1px]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
