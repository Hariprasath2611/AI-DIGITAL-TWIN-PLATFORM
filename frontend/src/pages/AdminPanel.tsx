import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface AdminStats {
  totalUsers: number;
  roles: {
    user: number;
    recruiter: number;
    admin: number;
  };
  totalUploads: number;
  recruiterInteractions: number;
  apiUsage: number;
  revenue: number;
}

interface UserRecord {
  _id: string;
  displayName: string;
  email: string;
  username: string;
  role: string;
  profileScore: number;
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);

        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6 text-sm">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Total Accounts</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats?.totalUsers || 4}</span>
          </div>
          <div className="p-3 bg-electricCyan/10 rounded-xl text-electricCyan">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Vector Documents</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats?.totalUploads || 6}</span>
          </div>
          <div className="p-3 bg-neonPurple/10 rounded-xl text-neonPurple">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">API Transactions</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats?.apiUsage || 1432}</span>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">MRR SaaS Revenue</span>
            <span className="text-2xl font-black text-white mt-1 block">${stats?.revenue || 450}.00</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Account Registry Table */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg flex items-center space-x-2">
              <Shield className="w-5 h-5 text-electricCyan" />
              <span>User Registry</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-gray-300">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="py-2">Display Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">No users found in database registry.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-bold text-white">{u.displayName}</td>
                      <td className="py-3 text-gray-400">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-500/10 text-red-400' : u.role === 'recruiter' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-electricCyan">{u.profileScore}%</td>
                      <td className="py-3 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System parameters */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="font-header font-bold text-sm">System Logs & API Bounds</h4>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
              <h5 className="font-bold text-amber-400 flex items-center space-x-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>API Usage Limits</span>
              </h5>
              <p className="text-[11px] text-gray-400 leading-normal">
                Platform API quotas currently limited to 500 Gemini requests per user daily. Vector indexing processes files in a background queue.
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1.5 text-gray-400">
                <span>Model Engine:</span>
                <span className="text-white font-bold">Gemini 1.5 Flash</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5 text-gray-400">
                <span>Vector Database:</span>
                <span className="text-white font-bold">Pinecone Cloud</span>
              </div>
              <div className="flex justify-between pb-1.5 text-gray-400">
                <span>Storage Engine:</span>
                <span className="text-white font-bold">Cloudinary API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
