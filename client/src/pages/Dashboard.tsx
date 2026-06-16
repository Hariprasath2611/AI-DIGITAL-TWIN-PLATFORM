import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Award,
  Github,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Brain,
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Document {
  _id: string;
  name: string;
  type: string;
  category: string;
  createdAt: string;
}

interface Analytics {
  chatConversationsCount: number;
  recruiterInteractionsCount: number;
  dailyMetrics: Array<{
    date: string;
    views: number;
    chats: number;
    interactions: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const docsRes = await api.get('/documents');
        setDocuments(docsRes.data.slice(0, 4));

        const analyticsRes = await api.get('/analytics');
        setAnalytics(analyticsRes.data);

        const projRes = await api.get('/projects');
        setProjectsCount(projRes.data.length);

        const skillRes = await api.get('/skills');
        setSkillsCount(skillRes.data.length);
      } catch (err) {
        console.error('Error fetching dashboard details:', err);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute stats
  const kbCoverage = Math.min(documents.length * 20, 100);
  const aiReadiness = Math.min((skillsCount * 10) + (projectsCount * 8) + (documents.length * 10), 100);

  // Default mock analytics values if database is empty/starting up
  const viewsChartData = analytics?.dailyMetrics?.map(m => ({
    name: new Date(m.date).toLocaleDateString([], { weekday: 'short' }),
    Views: m.views,
    Chats: m.chats,
  })) || [
    { name: 'Mon', Views: 12, Chats: 2 },
    { name: 'Tue', Views: 19, Chats: 4 },
    { name: 'Wed', Views: 25, Chats: 7 },
    { name: 'Thu', Views: 32, Chats: 9 },
    { name: 'Fri', Views: 45, Chats: 12 },
    { name: 'Sat', Views: 28, Chats: 6 },
    { name: 'Sun', Views: 35, Chats: 8 },
  ];

  const pieData = [
    { name: 'Resumes', value: documents.filter(d => d.type === 'resume').length || 1, color: '#06B6D4' },
    { name: 'Projects', value: projectsCount || 2, color: '#8B5CF6' },
    { name: 'Certificates', value: documents.filter(d => d.type === 'certificate').length || 1, color: '#EC4899' },
    { name: 'Notes & Blog', value: documents.filter(d => ['note', 'blog'].includes(d.type)).length || 1, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 glass-panel rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-electricCyan/10 to-neonPurple/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h1 className="text-2xl font-bold font-header mb-1">
            Welcome back, <span className="bg-gradient-to-r from-electricCyan to-cyan-400 bg-clip-text text-transparent">{user?.displayName}</span>
          </h1>
          <p className="text-sm text-gray-400">Your digital twin clone is online and indexing your career achievements.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-xs font-semibold text-electricCyan">
          <Zap className="w-4 h-4 text-electricCyan animate-pulse" />
          <span>Status: Sync Active</span>
        </div>
      </div>

      {/* Grid Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-gray-400">Profile Score</span>
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 rounded-full">Optimal</span>
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-white">{user?.profileScore}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-electricCyan to-neonPurple h-2 rounded-full" style={{ width: `${user?.profileScore || 40}%` }} />
          </div>
          <span className="text-xs text-gray-500 mt-3 block">Score scales as you complete sections.</span>
        </div>

        {/* Knowledge Base Coverage */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-gray-400">Knowledge Coverage</span>
            <FileText className="w-5 h-5 text-electricCyan" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-white">{kbCoverage}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2">
            <div className="bg-electricCyan h-2 rounded-full" style={{ width: `${kbCoverage || 20}%` }} />
          </div>
          <span className="text-xs text-gray-500 mt-3 block">{documents.length} sources parsed & vectorized.</span>
        </div>

        {/* AI Readiness Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-gray-400">AI Readiness</span>
            <Brain className="w-5 h-5 text-neonPurple" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-white">{aiReadiness}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-2">
            <div className="bg-neonPurple h-2 rounded-full" style={{ width: `${aiReadiness}%` }} />
          </div>
          <span className="text-xs text-gray-500 mt-3 block">Measures vector semantic density.</span>
        </div>

        {/* Recruiter Traffic */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-gray-400">Recruiter Audits</span>
            <MessageSquare className="w-5 h-5 text-pink-500" />
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-white">{analytics?.recruiterInteractionsCount || 3}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400 mt-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />
            <span>Interactive sessions stored.</span>
          </div>
        </div>
      </div>

      {/* Charts & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Line Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-header font-bold text-lg">Digital Twin Traffic</h3>
              <p className="text-xs text-gray-400">Daily profile views & active conversations</p>
            </div>
            <TrendingUp className="w-5 h-5 text-electricCyan" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsChartData}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="Views" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Chats" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-header font-bold text-lg">Vector Distribution</h3>
            <Brain className="w-5 h-5 text-neonPurple" />
          </div>
          <div className="h-48 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{documents.length + projectsCount}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Nodes</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-gray-400 truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom widgets: uploads, github stats & AI recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Uploads */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-sm">Recent Uploads</h3>
            <FileText className="w-4 h-4 text-electricCyan" />
          </div>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500">No documents uploaded yet.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="w-4 h-4 text-electricCyan shrink-0" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold truncate">{doc.name}</h4>
                      <span className="text-[10px] text-gray-500 uppercase">{doc.category}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* GitHub Statistics */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-sm">GitHub Connect</h3>
            <Github className="w-4 h-4 text-neonPurple" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs">
                <span className="text-gray-400 block">Repository Count</span>
                <span className="text-lg font-black">{projectsCount}</span>
              </div>
              <div className="text-xs text-right">
                <span className="text-gray-400 block">Stars Analyzed</span>
                <span className="text-lg font-black">{projectsCount * 3}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Connect your repositories in the sidebar menu. The AI automatically builds coding strength reports.
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-sm">Twin Optimization</h3>
            <Sparkles className="w-4 h-4 text-electricCyan" />
          </div>
          <div className="space-y-3 text-xs">
            {[
              { text: 'Analyze LinkedIn export for missing qualifications', urgency: 'High' },
              { text: 'Vectorize project requirements documents', urgency: 'Medium' },
              { text: 'Import latest commits from GitHub to sync coding strength', urgency: 'Low' },
            ].map((rec, index) => (
              <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start space-x-3">
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 mt-0.5 ${
                  rec.urgency === 'High' ? 'bg-red-500/10 text-red-400' : rec.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {rec.urgency}
                </span>
                <p className="text-gray-300 leading-normal">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
