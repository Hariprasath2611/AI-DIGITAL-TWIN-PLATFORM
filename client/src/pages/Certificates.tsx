import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Globe, Calendar, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface Certificate {
  _id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  url?: string;
  credentialId?: string;
}

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [url, setUrl] = useState('');
  const [credentialId, setCredentialId] = useState('');

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates');
      setCertificates(response.data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/certificates', {
        name,
        issuer,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        url: url || undefined,
        credentialId: credentialId || undefined,
      });

      // Clear Form
      setName('');
      setIssuer('');
      setIssueDate('');
      setExpiryDate('');
      setUrl('');
      setCredentialId('');

      await fetchCertificates();
    } catch (err) {
      console.error('Failed to save certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      await fetchCertificates();
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
            <span>Add Certificate</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Upload and record details of your credentials.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Certificate Name</label>
            <input
              type="text"
              placeholder="e.g. AWS Certified Solutions Architect"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Issuer Authority</label>
            <input
              type="text"
              placeholder="e.g. Amazon Web Services"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none text-gray-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Credential ID (Optional)</label>
            <input
              type="text"
              placeholder="AWS-SAR-12345"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Credential URL (Optional)</label>
            <input
              type="url"
              placeholder="https://credly.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Credential</span>}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg flex items-center space-x-2">
              <Award className="w-5 h-5 text-electricCyan" />
              <span>Credentials List</span>
            </h3>
            <span className="text-xs font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
              {certificates.length} Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[440px] pr-1">
            {certificates.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs col-span-2">No certificates found. Add your qualifications here.</div>
            ) : (
              certificates.map((cert) => (
                <div key={cert._id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                  <button
                    onClick={() => handleDelete(cert._id)}
                    className="absolute top-4 right-4 p-1 rounded bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-start space-x-3 pr-6">
                    <Award className="w-8 h-8 text-electricCyan shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{cert.name}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{cert.issuer}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Issued:{' '}
                        {new Date(cert.issueDate).toLocaleDateString([], {
                          month: 'short',
                          year: 'numeric',
                        })}
                        {cert.expiryDate && (
                          <>
                            {' '}
                            - Exp:{' '}
                            {new Date(cert.expiryDate).toLocaleDateString([], {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </>
                        )}
                      </span>
                    </div>
                    {cert.credentialId && (
                      <span className="block font-mono">ID: {cert.credentialId}</span>
                    )}
                  </div>

                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs text-electricCyan hover:underline space-x-1 pt-1"
                    >
                      <span>Verify Credential</span>
                      <Globe className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
