import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Brain, AlertCircle, Award, Star, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface EvaluationSession {
  _id: string;
  role: string;
  rating: number;
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    suggestedLearningPaths: string[];
  };
  createdAt: string;
}

const CareerCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interview' | 'sessions'>('interview');
  const [role, setRole] = useState('Senior Full Stack Developer');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat session
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [evaluation, setEvaluation] = useState<{
    session: EvaluationSession;
    overallFeedback: string;
  } | null>(null);

  // Past sessions
  const [pastSessions, setPastSessions] = useState<EvaluationSession[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/recruiter/sessions');
      setPastSessions(res.data);
    } catch (err) {
      console.error('Failed to load recruiter sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Welcome! I will act as your mock technical interviewer for the role of ${role}. Let's begin.\n\nCould you describe a challenging technical problem you solved recently and your approach to addressing it?`,
        timestamp: new Date(),
      },
    ]);
    setEvaluation(null);
    setInterviewStarted(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText, timestamp: new Date() }]);

    setLoading(true);
    try {
      // Prompt Gemini to respond in interviewer character
      const response = await api.post('/chat/assistant', {
        message: `[Mock Interview Context: You are technical lead interviewing candidate for role: ${role}. Respond in character, continue interview, ask next technical follow-up based on candidate reply.] Candidate reply: "${userText}"`,
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response.data.reply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('Interview response failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeInterview = async () => {
    setLoading(true);
    try {
      const response = await api.post('/chat/recruiter/evaluate', {
        role,
        messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
      });
      setEvaluation(response.data);
      setInterviewStarted(false);
      await fetchSessions();
    } catch (err) {
      console.error('Failed to evaluate interview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Navigation Tabs */}
      <div className="flex space-x-3 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('interview')}
          className={`pb-2 font-header font-bold text-sm border-b-2 transition ${
            activeTab === 'interview' ? 'border-electricCyan text-electricCyan' : 'border-transparent text-gray-400'
          }`}
        >
          Interview Simulator
        </button>
        <button
          onClick={() => {
            setActiveTab('sessions');
            fetchSessions();
          }}
          className={`pb-2 font-header font-bold text-sm border-b-2 transition ${
            activeTab === 'sessions' ? 'border-electricCyan text-electricCyan' : 'border-transparent text-gray-400'
          }`}
        >
          Past Sessions & Reports
        </button>
      </div>

      {activeTab === 'interview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Setup / Results Sidebar */}
          <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
            {!interviewStarted && !evaluation ? (
              <>
                <div>
                  <h3 className="font-header font-bold text-lg flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-electricCyan animate-pulse" />
                    <span>Setup Interview</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Select a role to begin technical evaluation.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Target Position</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
                    />
                  </div>
                  <button
                    onClick={startInterview}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center justify-center space-x-2 shadow-glowCyan"
                  >
                    <span>Start Mock Recruiter</span>
                  </button>
                </div>
              </>
            ) : interviewStarted ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-electricCyan/20 bg-electricCyan/5">
                  <h4 className="text-xs font-bold text-electricCyan mb-1 uppercase tracking-wider">Active Evaluation</h4>
                  <p className="text-xs text-gray-300">You are interviewing for the position of <strong>{role}</strong>.</p>
                </div>
                <button
                  onClick={completeInterview}
                  disabled={loading || messages.length < 2}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Finish & Generate Report</span>}
                </button>
              </div>
            ) : (
              // Evaluation Results
              <div className="space-y-5">
                <div className="text-center">
                  <span className="text-xs text-gray-400 block uppercase tracking-wider mb-1">Hiring Readiness</span>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-electricCyan shadow-glowCyan mb-2 bg-[#0B1120]">
                    <span className="text-3xl font-black text-white">{evaluation?.session.score}%</span>
                  </div>
                  <div className="flex justify-center space-x-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (evaluation?.session.rating || 3)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setEvaluation(null)}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-[#0F172A] font-bold hover:bg-white/5 transition"
                >
                  New Interview
                </button>
              </div>
            )}
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 glass-panel rounded-2xl h-[480px] flex flex-col overflow-hidden relative border-white/5">
            {!interviewStarted && !evaluation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Bot className="w-12 h-12 text-electricCyan/50 animate-bounce" />
                <h4 className="font-header font-bold text-md text-gray-300">Technical Interview Simulator</h4>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Select your target coding role and start an AI simulated assessment. You will receive customized grading, skill metrics and learning paths.
                </p>
              </div>
            ) : interviewStarted ? (
              <>
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0B1120]/25">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.sender === 'user' ? 'bg-[#0F172A] border-white/10' : 'bg-electricCyan/10 border-electricCyan/20'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-electricCyan" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-tr from-electricCyan/20 to-cyan-500/10 border border-electricCyan/35 text-gray-100 rounded-tr-none' 
                          : 'glass-panel rounded-tl-none border-white/5 text-gray-300'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-electricCyan/10 border-electricCyan/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-electricCyan animate-spin" />
                      </div>
                      <div className="p-4 glass-panel rounded-2xl rounded-tl-none text-xs text-gray-400 italic">
                        Evaluating response and drafting technical follow-up...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#0F172A]/35 flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Describe your technical architecture solution..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 p-3 rounded-xl border border-white/10 bg-[#0B1120] text-xs outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-3 rounded-xl bg-electricCyan text-darkBg shadow-glowCyan hover:scale-105 transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              // Full Feedback Report
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="font-header font-bold text-lg text-electricCyan flex items-center space-x-2">
                    <Award className="w-5 h-5 text-electricCyan" />
                    <span>Technical Grading Audit</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Evaluation report for candidate review.</p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-[#0F172A]/40 text-xs text-gray-300 leading-relaxed">
                  <h4 className="font-bold text-white mb-2">Overall Evaluator Summary:</h4>
                  {evaluation?.overallFeedback}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Strengths</span>
                    </h5>
                    <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                      {evaluation?.session.feedback.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel p-4 rounded-xl space-y-2">
                    <h5 className="font-bold text-red-400 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Weaknesses</span>
                    </h5>
                    <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                      {evaluation?.session.feedback.weaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl space-y-2">
                  <h5 className="font-bold text-electricCyan flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Suggested Learning Paths & Improvements</span>
                  </h5>
                  <ul className="list-decimal pl-4 text-xs text-gray-400 space-y-1">
                    {evaluation?.session.feedback.suggestedLearningPaths.concat(evaluation.session.feedback.improvements).map((path, idx) => (
                      <li key={idx}>{path}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Past Sessions List
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg flex items-center space-x-2">
              <Award className="w-5 h-5 text-electricCyan" />
              <span>Career Assessment Log</span>
            </h3>
            <span className="text-xs font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
              {pastSessions.length} Evaluations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs col-span-2">No past interviews on record. Complete your first session to build insights.</div>
            ) : (
              pastSessions.map((session) => (
                <div key={session._id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{session.role}</h4>
                      <span className="text-[10px] text-gray-500 uppercase">
                        {new Date(session.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-electricCyan/15 text-electricCyan shadow-glowCyan">
                      Score: {session.score}%
                    </span>
                  </div>

                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < session.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="pt-2 text-[11px] text-gray-400 space-y-1">
                    <span className="font-semibold block text-white">Top Strengths Identified:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {session.feedback.strengths.slice(0, 2).map((str, idx) => (
                        <li key={idx} className="truncate">{str}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerCenter;
