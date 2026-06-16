import React, { useState } from 'react';
import { Sparkles, Linkedin, Twitter, FileText, Clipboard, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';

const PersonalBrand: React.FC = () => {
  const [contentType, setContentType] = useState<'linkedin' | 'twitter' | 'bio' | 'resume_improvement'>('linkedin');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setCopied(false);
    try {
      const response = await api.post('/chat/brand', {
        type: contentType,
        prompt: prompt.trim(),
      });
      setResult(response.data.content);
    } catch (err) {
      console.error('Failed to generate brand content:', err);
      setResult('Failed to connect with Gemini API. Synced default mock backups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
      {/* Brand Prompt panel */}
      <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
        <div>
          <h3 className="font-header font-bold text-lg flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-electricCyan animate-pulse" />
            <span>Brand Builder</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Generate high-performance social assets reflecting your tone.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-2">Content Target</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setContentType('linkedin')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  contentType === 'linkedin'
                    ? 'border-[#0A66C2] bg-[#0A66C2]/15 text-[#0A66C2] shadow-glowCyan'
                    : 'border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn Post</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('twitter')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  contentType === 'twitter'
                    ? 'border-electricCyan bg-electricCyan/15 text-electricCyan shadow-glowCyan'
                    : 'border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter Thread</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('bio')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  contentType === 'bio'
                    ? 'border-neonPurple bg-neonPurple/15 text-neonPurple shadow-glowPurple'
                    : 'border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Personal Bio</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('resume_improvement')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  contentType === 'resume_improvement'
                    ? 'border-pink-500 bg-pink-500/15 text-pink-500 shadow-glowPurple'
                    : 'border-white/5 text-gray-400 hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume Audit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">What should the content focus on?</label>
            <textarea
              placeholder="e.g. My thoughts on modular bundlers and shadcn interfaces..."
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none resize-none leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Synthesize Content</span>}
          </button>
        </form>
      </div>

      {/* Brand Result panel */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between border-white/5">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg">AI Generated Content Output</h3>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1 rounded bg-white/5 border border-white/5 hover:border-white/10 text-xs transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-[#0B1120]/40 rounded-xl p-4 min-h-[350px] border border-white/5 relative overflow-y-auto">
            {result ? (
              <p className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed text-xs">
                {result}
              </p>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <span>Fill out the generation parameters and hit Synthesize. The twin model will format social postings matching your vocabulary profile.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBrand;
