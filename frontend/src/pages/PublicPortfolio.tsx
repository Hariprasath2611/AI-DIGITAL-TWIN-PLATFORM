import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Bot, User, Send, Award, Code, X, Sparkles } from 'lucide-react';
import api from '../services/api';

interface UserProfile {
  username: string;
  displayName: string;
  photoURL?: string;
  writingStyleProfile?: {
    tone: string;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  url?: string;
  githubUrl?: string;
  technologies: string[];
  achievements: string[];
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: string;
}

interface Experience {
  _id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Certificate {
  _id: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

interface Memory {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const PublicPortfolio: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'experience' | 'skills' | 'certificates' | 'memories'>('about');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        if (!username) return;
        const response = await api.get(`/users/username/${username}`);
        setProfile(response.data.user);
        setProjects(response.data.projects);
        setSkills(response.data.skills);
        setExperiences(response.data.experiences);
        setCertificates(response.data.certificates);
        setMemories(response.data.memories);

        // Record profile view
        await api.post(`/analytics/view/${username}`);
      } catch (err) {
        console.error('Failed to load public portfolio details:', err);
      }
    };
    fetchPublicData();
  }, [username]);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-gray-100">
        <Brain className="w-16 h-16 text-electricCyan animate-bounce mb-4" />
        <h2 className="text-xl font-bold font-header">Scanning digital twin registry...</h2>
      </div>
    );
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const query = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    setMessages((prev) => [...prev, { sender: 'user', text: query, timestamp: new Date() }]);

    try {
      const response = await api.post(`/chat/visitor/${username}`, {
        message: query,
        conversationId,
        visitorId: 'portfolio-visitor',
      });

      setConversationId(response.data.conversationId);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response.data.reply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('Visitor chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `I apologize. I couldn't reach the model. Ask me about the projects or career experience.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-darkBg text-gray-100 overflow-x-hidden font-sans">
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />

      {/* Header Profile Title card */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center md:text-left md:flex md:items-center md:space-x-8 z-10 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0 rounded-full overflow-hidden border-2 border-electricCyan shadow-glowCyan shrink-0"
        >
          <img
            src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.displayName}`}
            alt={profile.displayName}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="mt-6 md:mt-0 flex-1 space-y-3">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-header bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {profile.displayName}
              </h1>
              <span className="text-xs text-electricCyan font-semibold uppercase tracking-wider block mt-1">
                AI Digital Twin Active
              </span>
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="mt-4 md:mt-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold shadow-glowCyan hover:scale-105 transition flex items-center justify-center space-x-2 text-xs"
            >
              <Bot className="w-4.5 h-4.5" />
              <span>Ask My AI Twin</span>
            </button>
          </motion.div>
          
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
            This portfolio is represented by an active generative model trained directly on the candidate's professional resume, certificates, and codebases.
          </p>
        </div>
      </header>

      {/* Tabs list navigation */}
      <section className="max-w-5xl mx-auto px-6 py-4 border-y border-white/5 bg-[#0F172A]/20 backdrop-blur-md sticky top-0 z-20 flex space-x-6 overflow-x-auto">
        {[
          { id: 'about', label: 'About' },
          { id: 'projects', label: 'Projects' },
          { id: 'experience', label: 'Experience' },
          { id: 'skills', label: 'Skills' },
          { id: 'certificates', label: 'Credentials' },
          { id: 'memories', label: 'Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-1 text-xs font-bold font-header border-b-2 uppercase tracking-wider transition shrink-0 ${
              activeTab === tab.id ? 'border-electricCyan text-electricCyan' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Portfolio views */}
      <main className="max-w-5xl mx-auto px-6 py-10 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="font-header font-bold text-lg text-white">About the Developer</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Welcome to my portfolio! My digital twin clone is online to answer questions regarding my capabilities, technical background, and project outcomes.
                </p>
                <div className="p-4 rounded-xl border border-white/5 bg-[#0B1120]/60 text-xs text-gray-400">
                  <span className="font-bold text-white block mb-1">AI Writing Style Note:</span>
                  My chatbot has been tuned to respond using my personal vocabulary profiles and typical communication patterns.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {projects.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-gray-500 col-span-2">No projects published.</div>
              ) : (
                projects.map((proj) => (
                  <div key={proj._id} className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-electricCyan/30 transition">
                    <div>
                      <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{proj.description}</p>
                    </div>
                    <div className="space-y-3 pt-3">
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-electricCyan/10 text-electricCyan border border-electricCyan/20">
                            {t}
                          </span>
                        ))}
                      </div>
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-gray-400 hover:text-white space-x-1.5">
                          <Code className="w-4 h-4" />
                          <span>View Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'experience' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-l border-white/10 pl-6 ml-4 space-y-8"
            >
              {experiences.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-gray-500">No positions listed.</div>
              ) : (
                experiences.map((exp) => (
                  <div key={exp._id} className="relative space-y-2">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-electricCyan shadow-glowCyan" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                      <span className="text-xs text-electricCyan font-semibold">{exp.company}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} -{' '}
                        {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{exp.description}</p>
                    {exp.achievements.length > 0 && (
                      <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1">
                        {exp.achievements.map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl space-y-6"
            >
              <h3 className="font-header font-bold text-lg text-white">Skills Matrix</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {skills.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 col-span-4">No skills registered.</div>
                ) : (
                  skills.map((skill) => (
                    <div key={skill._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
                      <span className="text-xs font-bold text-white truncate">{skill.name}</span>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-gray-500 uppercase">{skill.category}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-electricCyan/15 text-electricCyan">
                          {skill.proficiency}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {certificates.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-gray-500 col-span-2">No certificates found.</div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert._id} className="glass-panel p-4 rounded-xl flex items-center space-x-3">
                    <Award className="w-8 h-8 text-electricCyan shrink-0" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate leading-snug">{cert.name}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5 truncate">{cert.issuer}</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'memories' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-l border-white/10 pl-6 ml-4 space-y-8"
            >
              {memories.length === 0 ? (
                <div className="glass-panel p-8 rounded-2xl text-center text-xs text-gray-500">No milestones recorded.</div>
              ) : (
                memories.map((mem) => (
                  <div key={mem._id} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-electricCyan shadow-glowCyan" />
                    <span className="text-[9px] text-electricCyan font-bold uppercase tracking-wider">
                      {new Date(mem.date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                    </span>
                    <h4 className="text-xs font-bold text-white">{mem.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{mem.description}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chatbot Drawer widget */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0B1120] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#0F172A]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-electricCyan/15 border border-electricCyan/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-electricCyan" />
                </div>
                <div>
                  <h3 className="font-header font-bold text-xs">Chat with {profile.displayName.split(' ')[0]}'s Twin</h3>
                  <span className="text-[9px] text-gray-500">Ask about skills, work history, or code specs</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1120]/30 text-xs">
              {messages.length === 0 && (
                <div className="text-center p-6 text-gray-500">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40 text-electricCyan" />
                  <span>Hello! I am {profile.displayName.split(' ')[0]}'s virtual assistant clone. Ask me questions like "What languages do you know?" or "Describe your technical projects."</span>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                    msg.sender === 'user' ? 'bg-[#0F172A] border-white/10' : 'bg-electricCyan/10 border-electricCyan/20'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5 text-gray-300" /> : <Bot className="w-3.5 h-3.5 text-electricCyan" />}
                  </div>
                  <div className={`p-3 rounded-xl leading-relaxed ${
                    msg.sender === 'user' ? 'bg-electricCyan/20 text-white rounded-tr-none' : 'glass-panel rounded-tl-none border-white/5 text-gray-300'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-electricCyan/10 border border-electricCyan/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-electricCyan animate-spin" />
                  </div>
                  <div className="p-3 glass-panel rounded-xl rounded-tl-none text-gray-400 italic">
                    Twin clone generating answer...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-[#0F172A]/30 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="flex-1 p-2.5 rounded-lg border border-white/10 bg-[#0B1120] text-xs outline-none"
                required
              />
              <button type="submit" disabled={chatLoading} className="p-2.5 rounded-lg bg-electricCyan text-darkBg shadow-glowCyan hover:scale-105 transition">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg shadow-glowCyan flex items-center justify-center hover:scale-105 hover:rotate-6 transition z-40"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default PublicPortfolio;
