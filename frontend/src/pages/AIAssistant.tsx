import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Brain } from 'lucide-react';
import api from '../services/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your AI Digital Twin. I represent your skills, history, and knowledge base. Ask me anything about yourself (e.g. 'Explain my experience at Acme' or 'Summarize my technical stack') to verify how I answer visitors and recruiters.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');
    setLoading(true);

    // Append user message locally
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMessageText, timestamp: new Date() },
    ]);

    try {
      const response = await api.post('/chat/assistant', {
        message: userMessageText,
        conversationId,
      });

      const replyText = response.data.reply;
      setConversationId(response.data.conversationId);

      // Append AI reply
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: replyText, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('AI response error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error connecting to Gemini API. Please check backend connection logs.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl h-[calc(100vh-180px)] flex flex-col overflow-hidden max-w-4xl mx-auto border-white/5 shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0F172A]/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-electricCyan/15 border border-electricCyan/30 flex items-center justify-center shadow-glowCyan">
            <Brain className="w-5 h-5 text-electricCyan" />
          </div>
          <div>
            <h3 className="font-header font-bold text-sm">AI Digital Twin Assistant</h3>
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Powered by Gemini & Pinecone Retrieval</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-500/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Clone Synced</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0B1120]/25">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
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
              <span className="text-[9px] text-gray-500 block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start space-x-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-electricCyan/10 border border-electricCyan/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-electricCyan animate-spin" />
            </div>
            <div className="p-4 glass-panel rounded-2xl rounded-tl-none text-xs text-gray-400 italic">
              AI Twin is reviewing knowledge base nodes...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#0F172A]/35 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Ask about your experience, project specs, or write bios..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 p-3 rounded-xl border border-white/10 bg-[#0B1120] text-xs outline-none focus:border-electricCyan transition"
          required
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg shadow-glowCyan hover:scale-105 transition disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
