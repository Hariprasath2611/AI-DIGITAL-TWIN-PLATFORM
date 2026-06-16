import React, { useState } from 'react';
import { Settings, User, Sparkles, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SettingsPage: React.FC = () => {
  const { user, syncProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  
  // Writing style
  const [tone, setTone] = useState(user?.writingStyleProfile?.tone || 'Professional, informative, and engaging');
  const [vocab, setVocab] = useState(user?.writingStyleProfile?.vocabulary?.join(', ') || 'efficient, scalable, modern');
  const [patterns, setPatterns] = useState(user?.writingStyleProfile?.patterns?.join('\n') || 'Starts with a hook\nUses bullet points\nEnds with a question');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.put('/users/profile', {
        displayName,
        photoURL,
        writingStyleProfile: {
          tone,
          vocabulary: vocab.split(',').map((v) => v.trim()).filter(Boolean),
          patterns: patterns.split('\n').map((p) => p.trim()).filter(Boolean),
        },
      });

      await syncProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-sm">
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-electricCyan/10 to-transparent rounded-full blur-xl pointer-events-none" />
        <h3 className="font-header font-bold text-lg flex items-center space-x-2">
          <Settings className="w-5 h-5 text-electricCyan animate-spin-slow" />
          <span>Brand Settings</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1">Configure your public brand identity and AI writing style profile.</p>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Profile specs */}
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center space-x-1.5 border-b border-white/5 pb-1.5">
              <User className="w-4 h-4 text-electricCyan" />
              <span>User Profile</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Writing style tuning */}
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center space-x-1.5 border-b border-white/5 pb-1.5">
              <Sparkles className="w-4 h-4 text-neonPurple" />
              <span>Writing Style Tuning</span>
            </h4>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">AI Response Tone</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Vocabulary Keywords (Comma Separated)</label>
              <input
                type="text"
                value={vocab}
                onChange={(e) => setVocab(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Sentence Patterns (One per line)</label>
              <textarea
                rows={3}
                value={patterns}
                onChange={(e) => setPatterns(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center space-x-2 shadow-glowCyan disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
