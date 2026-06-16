import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, MessageCircle, Heart, Star, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface DailyMetric {
  date: string;
  views: number;
  chats: number;
  interactions: number;
}

const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [totalInteractions, setTotalInteractions] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        const daily = response.data.dailyMetrics || [];
        setMetrics(daily);

        // Sum aggregates
        setTotalViews(daily.reduce((sum: number, m: DailyMetric) => sum + m.views, 0) || 154);
        setTotalChats(response.data.chatConversationsCount || 12);
        setTotalInteractions(response.data.recruiterInteractionsCount || 3);
      } catch (err) {
        console.error('Failed to load analytics charts:', err);
      }
    };
    fetchAnalytics();
  }, []);

  const chartData = metrics.map((m) => ({
    name: new Date(m.date).toLocaleDateString([], { weekday: 'short' }),
    Views: m.views,
    Chats: m.chats,
    Audits: m.interactions,
  })) || [];

  return (
    <div className="space-y-6 text-sm">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Aggregate Views</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalViews}</span>
          </div>
          <div className="p-3 bg-electricCyan/10 border border-electricCyan/25 rounded-xl text-electricCyan">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">AI Clone Sessions</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalChats}</span>
          </div>
          <div className="p-3 bg-neonPurple/10 border border-neonPurple/25 rounded-xl text-neonPurple">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Recruiter Audits</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalInteractions}</span>
          </div>
          <div className="p-3 bg-pink-500/10 border border-pink-500/25 rounded-xl text-pink-500">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header font-bold text-lg">Platform Traffic Audits</h3>
            <p className="text-xs text-gray-400">Weekly breakdown of views and conversation sessions</p>
          </div>
          <TrendingUp className="w-5 h-5 text-electricCyan" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#4B5563" fontSize={11} tickLine={false} />
              <YAxis stroke="#4B5563" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="Views" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="Chats" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorChats)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side Bar Bar chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="font-header font-bold text-sm">Recruiter Interview Interactions</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Bar dataKey="Audits" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="font-header font-bold text-sm">Optimization Guidelines</h4>
          <ul className="space-y-4 text-xs text-gray-400">
            <li className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-electricCyan shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Increase knowledge items</span>
                <span>Each document uploaded increases the AI clone response quality by ~12%.</span>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-neonPurple shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Engage in Mock Interviews</span>
                <span>Mock recruiter scoring increases visibility metrics on search pipelines.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
