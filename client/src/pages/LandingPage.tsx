import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Code, Share2, Compass, ArrowRight, Shield, Zap, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { loginWithMock, user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleDemoLogin = async (role: 'user' | 'recruiter' | 'admin') => {
    await loginWithMock(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-darkBg text-gray-100 font-sans">
      {/* Mesh Glow Background */}
      <div className="absolute inset-0 bg-mesh opacity-80 pointer-events-none" />

      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-borderGlass bg-[#0B1120]/80 backdrop-blur-md">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Brain className="w-8 h-8 text-electricCyan animate-pulse" />
          <span className="font-header text-xl font-bold tracking-wider bg-gradient-to-r from-electricCyan to-neonPurple bg-clip-text text-transparent">
            AI DIGITAL TWIN
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg shadow-glowCyan hover:scale-105 transition-all duration-300"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDemoLogin('user')}
                className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border border-electricCyan/40 text-electricCyan hover:bg-electricCyan/10 transition"
              >
                Demo User
              </button>
              <button
                onClick={() => handleDemoLogin('recruiter')}
                className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border border-neonPurple/40 text-neonPurple hover:bg-neonPurple/10 transition"
              >
                Demo Recruiter
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center max-w-5xl mx-auto z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-6"
        >
          {/* Animated Glow Circle */}
          <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-tr from-electricCyan to-neonPurple blur-xl opacity-30 animate-pulse-slow" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full border border-electricCyan/30 bg-[#0B1120]/60 backdrop-blur-md flex items-center justify-center shadow-glowCyan">
            <Brain className="w-16 h-16 md:w-20 md:h-20 text-electricCyan animate-bounce" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-header text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
        >
          Your Living{' '}
          <span className="bg-gradient-to-r from-electricCyan via-cyan-400 to-neonPurple bg-clip-text text-transparent">
            AI Digital Twin
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed"
        >
          Create an intelligent, interactive version of yourself. Learn from your resumes, GitHub repositories, writing styles, and memories to represent you to recruiters 24/7.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button
            onClick={() => handleDemoLogin('user')}
            className="flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold shadow-glowCyan hover:shadow-glowPurple transition duration-300 transform hover:-translate-y-0.5"
          >
            <span>Build Your Twin</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDemoLogin('recruiter')}
            className="flex items-center justify-center space-x-2 px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-bold transition duration-300"
          >
            <span>Recruiter Portal</span>
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-16 max-w-6xl mx-auto z-10">
        <h2 className="font-header text-3xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Comprehensive AI Capability
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: <Brain className="w-8 h-8 text-electricCyan" />,
              title: 'Knowledge Base',
              desc: 'Vectorize resumes, documents, blog posts, and notes with automated OCR categorization.',
            },
            {
              icon: <Code className="w-8 h-8 text-neonPurple" />,
              title: 'GitHub Integration',
              desc: 'Import repositories and history to auto-generate technical strength audits.',
            },
            {
              icon: <Sparkles className="w-8 h-8 text-electricCyan" />,
              title: 'Portfolio Chat Widget',
              desc: 'Embed a floating digital clone that answers questions in your own writing style.',
            },
            {
              icon: <Compass className="w-8 h-8 text-neonPurple" />,
              title: 'Mock Recruiter',
              desc: 'Simulate tech and behavioral interviews with custom scoring and roadmaps.',
            },
          ].map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, borderColor: 'rgba(6, 182, 212, 0.4)' }}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">{feat.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="relative px-6 py-16 max-w-4xl mx-auto z-10 border-t border-borderGlass">
        <h2 className="font-header text-3xl font-bold text-center mb-16">How It Works</h2>
        <div className="relative border-l-2 border-electricCyan/20 pl-8 ml-4 space-y-12">
          {[
            { step: '1', title: 'Upload Raw Data', desc: 'Add resumes, project papers, notes, or connect GitHub. The system parses and indexes document structures.' },
            { step: '2', title: 'AI Training', desc: 'Our Gemini embedding pipeline vectors the text and extracts your personal tone, patterns, and vocabulary.' },
            { step: '3', title: 'Publish Digital Twin', desc: 'Deploy your public portfolio page. Visitors and hiring agents can chat directly with your virtual clone.' },
            { step: '4', title: 'Track Insights', desc: 'Observe profile visits, chat analytics, and mock interview success rates on your unified dashboard.' },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              {/* Bullet Node */}
              <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-[#0B1120] border-2 border-electricCyan flex items-center justify-center font-bold text-sm text-electricCyan shadow-glowCyan">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-1">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-6 py-16 max-w-5xl mx-auto z-10 border-t border-borderGlass">
        <h2 className="font-header text-3xl font-bold text-center mb-4">Transparent Pricing</h2>
        <p className="text-center text-gray-400 mb-12">Choose the path that fits your career acceleration</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Core Twin', price: '$0', desc: 'Essential portfolio clone', features: ['1 User Profile', 'GitHub repository analysis', 'Basic Chatbot Widget', 'Standard PDF uploads'] },
            { name: 'Professional (Popular)', price: '$15', desc: 'Full career accelerator', features: ['Unlimited uploads', 'Finetuned writing style', 'Advanced Mock Recruiter sessions', 'Detailed analytics charts', 'Socket notifications'], popular: true },
            { name: 'Enterprise API', price: '$49', desc: 'For agencies and teams', features: ['Multiple twin hosting', 'Custom model endpoints', 'Full branding templates', 'Dedicated support'] }
          ].map((tier, idx) => (
            <div
              key={idx}
              className={`glass-panel p-8 rounded-2xl flex flex-col justify-between relative ${tier.popular ? 'border-electricCyan/50 shadow-glowCyan' : ''}`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline space-x-1 mb-4">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center space-x-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-electricCyan" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleDemoLogin('user')}
                className={`w-full py-2.5 rounded-xl font-bold transition ${tier.popular ? 'bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg shadow-glowCyan hover:scale-105' : 'border border-white/10 hover:bg-white/5'}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative px-6 py-16 max-w-3xl mx-auto z-10 border-t border-borderGlass">
        <h2 className="font-header text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How does the AI Digital Twin learn about me?', a: 'By parsing files like resumes, notes, or blog posts, as well as scraping public repositories on GitHub. It chunks the text, creates high-dimensional vector embeddings, and uses semantic retrieval to query facts when someone chats with it.' },
            { q: 'What is the Writing Style learning feature?', a: 'Our writing style service analyzes your notes and posts to learn patterns, vocabulary frequency, and tone (e.g. conversational vs academic). It injects this tone as system instructions into Gemini, ensuring outputs match your identity.' },
            { q: 'Can recruiters verify my qualifications?', a: 'Yes! The clone answers queries using your knowledge base. It can provide links to projects, experience logs, and certificates stored in your profile.' },
            { q: 'Is my data secure?', a: 'Absolutely. We enforce JSON Web Token validation, Firebase authorization checks, and secure document sandboxing.' },
          ].map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left font-bold hover:bg-white/5 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === idx ? 'transform rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-6 pt-0 border-t border-white/5 text-gray-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-borderGlass py-8 text-center text-sm text-gray-500 relative z-10 bg-[#0B1120]/90">
        <p>© 2026 AI Digital Twin Platform. Powered by Google Gemini & Mongoose.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
