import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, PenTool, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

interface Document {
  _id: string;
  name: string;
  type: string;
  fileUrl?: string;
  embeddingsIndexed: boolean;
  category: string;
  createdAt: string;
}

const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('project_doc');
  const [file, setFile] = useState<File | null>(null);

  // Notes Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');

  // Trigger re-fetch helper
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle File Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please ensure file size and types are valid.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Note Submission
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    setLoading(true);
    try {
      await api.post('/documents/note', {
        name: noteTitle,
        contentText: noteContent,
        type: noteType,
      });
      setNoteTitle('');
      setNoteContent('');
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this knowledge record? This will delete all associated semantic vector embeddings.')) return;
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocuments();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload Drop Zone & File Form */}
      <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
        <div>
          <h3 className="font-header font-bold text-lg flex items-center space-x-2">
            <Upload className="w-5 h-5 text-electricCyan" />
            <span>Upload Documents</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Upload resumes, certificates, and portfolio documents.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] text-sm text-gray-200 outline-none"
            >
              <option value="resume">Resume PDF</option>
              <option value="project_doc">Project Document / Paper</option>
              <option value="certificate">Certification PDF</option>
              <option value="portfolio">Portfolio Files</option>
            </select>
          </div>

          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-electricCyan/50 transition cursor-pointer bg-[#0B1120]/40">
            <input
              type="file"
              id="file-input"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              required
            />
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <span className="text-xs text-gray-400 block truncate">
              {file ? file.name : 'Drag & drop file or click to browse'}
            </span>
            <span className="text-[10px] text-gray-600 block mt-1">Supports PDF, TXT, MD up to 10MB</span>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electricCyan to-neonPurple text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Index</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Note Creator Form */}
      <div className="glass-panel p-6 rounded-2xl h-fit space-y-6">
        <div>
          <h3 className="font-header font-bold text-lg flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-neonPurple" />
            <span>Create Note / Blog</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">Add background stories, personal essays, or technology notes.</p>
        </div>

        <form onSubmit={handleSaveNote} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoteType('note')}
                className={`py-2 rounded-xl text-xs font-semibold border ${noteType === 'note' ? 'border-neonPurple bg-neonPurple/15 text-neonPurple shadow-glowPurple' : 'border-white/5 text-gray-400 hover:bg-white/5'}`}
              >
                Personal Note
              </button>
              <button
                type="button"
                onClick={() => setNoteType('blog')}
                className={`py-2 rounded-xl text-xs font-semibold border ${noteType === 'blog' ? 'border-electricCyan bg-electricCyan/15 text-electricCyan shadow-glowCyan' : 'border-white/5 text-gray-400 hover:bg-white/5'}`}
              >
                Blog Post
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. My Architecture Philosophy"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] text-sm text-gray-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">Content</label>
            <textarea
              placeholder="Write your note contents here..."
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0F172A] text-sm text-gray-200 outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !noteTitle || !noteContent}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neonPurple to-electricCyan text-darkBg font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save Record</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Knowledge Base Records List */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-header font-bold text-lg flex items-center space-x-2">
              <Database className="w-5 h-5 text-electricCyan" />
              <span>Knowledge Base</span>
            </h3>
            <span className="text-xs font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
              {documents.length} Records
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {documents.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">No records index found. Upload files to get started.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-electricCyan shrink-0" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold truncate">{doc.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[9px] text-gray-500 uppercase">{doc.category}</span>
                        {doc.embeddingsIndexed ? (
                          <span className="flex items-center text-[9px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Indexed
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-400 font-semibold animate-pulse">
                            Processing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1 rounded bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
