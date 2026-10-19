import React, { useState, useEffect } from 'react';
import { 
  Archive, Download, RotateCcw, Trash2, Plus, Sparkles, HardDrive, 
  Calendar, CheckCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { BackupArchive } from '../types';

interface BackupVaultViewProps {
  showToast: (msg: string, type?: 'success' | 'warn' | 'error') => void;
  formatFileSize: (bytes: number) => string;
}

export const BackupVaultView: React.FC<BackupVaultViewProps> = ({ showToast, formatFileSize }) => {
  const [backups, setBackups] = useState<BackupArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchBackups = () => {
    setLoading(true);
    fetch('/api/backups')
      .then(r => r.json())
      .then(d => {
        setBackups(d.backups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreate = (type: 'FULL' | 'WORLD' | 'PLUGINS' = 'FULL') => {
    setCreating(true);
    fetch('/api/backups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
      .then(r => r.json())
      .then(d => {
        setCreating(false);
        if (d.success) {
          showToast(`Snapshot ${d.backup.fileName} created!`, 'success');
          fetchBackups();
        } else {
          showToast('Failed to create backup', 'error');
        }
      })
      .catch(() => {
        setCreating(false);
        showToast('Error creating backup', 'error');
      });
  };

  const handleRestore = (fileName: string) => {
    if (!confirm(`Are you sure you want to restore "${fileName}"? This will overwrite existing files with this snapshot.`)) {
      return;
    }
    setRestoringId(fileName);
    fetch(`/api/backups/${encodeURIComponent(fileName)}/restore`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setRestoringId(null);
        if (d.success) {
          showToast(d.message, 'success');
        } else {
          showToast(d.message, 'error');
        }
      })
      .catch(() => {
        setRestoringId(null);
        showToast('Error restoring backup', 'error');
      });
  };

  const handleDelete = (fileName: string) => {
    fetch(`/api/backups/${encodeURIComponent(fileName)}`, { method: 'DELETE' })
      .then(() => {
        showToast(`Backup ${fileName} deleted`, 'success');
        fetchBackups();
      });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-[#0d1424] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Archive className="w-4 h-4" />
            1-Click World & Config Backup Vault
          </div>
          <h3 className="text-lg font-black text-white">
            Instant Snapshot Recovery Engine
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Safeguards your worlds and plugin configurations into timestamped ZIP archives. 
            Before modifying or testing experimental plugins, capture an instant recovery point.
          </p>
        </div>

        {/* Snapshot Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCreate('FULL')}
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creating...' : 'Full Snapshot'}
          </button>
          <button
            onClick={() => handleCreate('PLUGINS')}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Plugins Only
          </button>
          <button
            onClick={() => handleCreate('WORLD')}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            World Only
          </button>
        </div>
      </div>

      {/* Snapshot Archives List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200">
            Stored Snapshots ({backups.length})
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Stored in server_data/backups/
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="p-10 rounded-2xl border-2 border-dashed border-slate-800 bg-[#0d1424]/60 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Archive className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h5 className="text-base font-bold text-white">No Snapshots Created Yet</h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Full Snapshot" above to create an instant disaster recovery backup of your server.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backups.map(b => (
              <div 
                key={b.id}
                className="p-5 bg-[#0b101c] rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white block truncate font-mono" title={b.fileName}>
                      {b.fileName}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      b.type === 'FULL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      b.type === 'WORLD' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {b.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      {formatFileSize(b.sizeBytes)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleRestore(b.fileName)}
                    disabled={restoringId === b.fileName}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {restoringId === b.fileName ? 'Restoring...' : 'Restore'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/api/backups/download/${encodeURIComponent(b.fileName)}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Download Archive"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(b.fileName)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 cursor-pointer"
                      title="Delete Backup"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
