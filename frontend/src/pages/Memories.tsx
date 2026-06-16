import React, { useState, useEffect } from 'react';
import { History, Plus, Trash2, Calendar, Tag, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface Memory {
  _id: string;
  title: string;
  description: string;
  category: 'achievement' | 'milestone' | 'learning' | 'project' | 'career_event';
  date: string;
  tags: string[];
}

const Memories: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'achievement' | 'milestone' | 'learning' | 'project' | 'career_event'>('milestone');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState('');

  const fetchMemories = async () => {
    try {
      const response = await api.get('/memories');
      setMemories(response.data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/memories', {
        title,
        description,
        category,
        date: new Date(date),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setDate('');
      setTags('');

      await fetchMemories();
    } catch (err) {
      console.error('Failed to save memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this memory record from your timeline?')) return;
    try {
      await api.delete(`/memories/${id}`);
      await fetchMemories();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
      {/* Form */}
      <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
        <div>
          <h3 className="font-header font-bold text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-electricCyan" />
            <span>Record Memory</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Record milestones, achievements, and career accomplishments.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Launched Twin Platform Beta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none text-gray-300"
            >
              <option value="milestone">Milestone</option>
              <option value="achievement">Achievement</option>
              <option value="learning">Learning Log</option>
              <option value="project">Project Release</option>
              <option value="career_event">Career Event</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none text-gray-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="beta, release, node"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
            <textarea
              placeholder="Give a short summary of this milestone..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Record Event</span>}
          </button>
        </form>
      </div>

      {/* List / Vertical Timeline */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg flex items-center space-x-2">
              <History className="w-5 h-5 text-electricCyan" />
              <span>Digital Memories Timeline</span>
            </h3>
            <span className="text-xs font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
              {memories.length} Events
            </span>
          </div>

          <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 overflow-y-auto max-h-[440px] pr-1 pt-2">
            {memories.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">Timeline empty. Record a new memory to add history logs.</div>
            ) : (
              memories.map((mem) => (
                <div key={mem._id} className="relative space-y-2">
                  {/* Timeline Bullet Node */}
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-electricCyan border border-[#0B1120] shadow-glowCyan" />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-electricCyan font-bold uppercase tracking-wider">
                        {mem.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">{mem.title}</h4>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(mem.date).toLocaleDateString([], { month: 'short', year: 'numeric', day: 'numeric' })}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(mem._id)}
                        className="p-1 rounded hover:bg-white/5 text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">{mem.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {mem.tags.map((tag, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-500 border border-white/5">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memories;
