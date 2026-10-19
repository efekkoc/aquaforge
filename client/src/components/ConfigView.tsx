import React, { useState, useEffect } from 'react';
import { FileCode, Save, CheckCircle2, AlertTriangle, Wand2, ShieldCheck } from 'lucide-react';

interface ConfigItem {
  path: string;
  name: string;
  type: 'yaml' | 'properties';
}

export const ConfigView: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('plugins/AquaFishing/config.yml');
  const [fileContent, setFileContent] = useState<string>('');
  const [validation, setValidation] = useState<{ valid: boolean; error?: string; line?: number; warnings: string[] }>({
    valid: true,
    warnings: []
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/configs')
      .then(r => r.json())
      .then(d => {
        setConfigs(d.configs || []);
        if (d.configs && d.configs.length > 0) {
          const defaultFile = d.configs.find((c: ConfigItem) => c.path.includes('AquaFishing')) || d.configs[0];
          setSelectedPath(defaultFile.path);
          loadFile(defaultFile.path);
        }
      })
      .catch(() => {});
  }, []);

  const loadFile = (path: string) => {
    fetch(`/api/configs/read?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(d => {
        setFileContent(d.content);
        validateContent(d.content, path);
      });
  };

  const validateContent = (text: string, path: string) => {
    if (path.endsWith('.properties')) {
      setValidation({ valid: true, warnings: [] });
      return;
    }

    fetch('/api/configs/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    })
      .then(r => r.json())
      .then(res => setValidation(res))
      .catch(() => {});
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFileContent(text);
    validateContent(text, selectedPath);
  };

  const handleFixIndentation = () => {
    fetch('/api/configs/fix-indentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fileContent })
    })
      .then(r => r.json())
      .then(d => {
        setFileContent(d.content);
        validateContent(d.content, selectedPath);
      });
  };

  const handleSave = () => {
    fetch('/api/configs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedPath, content: fileContent })
    })
      .then(r => r.json())
      .then(d => {
        setSaveStatus(d.message);
        setTimeout(() => setSaveStatus(null), 3000);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0c1828] to-[#121e33] rounded-2xl border border-cyan-800/40 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileCode className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">YAML Config Studio & Validator</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Eliminates illegal tabs, misalignment, and malformed YAML syntax before your server boots. Auto-generates instant <code className="text-cyan-300 font-mono">.backup</code> files for zero risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFixIndentation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            title="Convert any tabs to 2 spaces automatically"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto-Fix Indentation
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Backup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: File Selector */}
        <div className="p-4 bg-[#0e1524] rounded-2xl border border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Config Files
          </span>

          <div className="space-y-1.5">
            {configs.map((c) => (
              <button
                key={c.path}
                onClick={() => {
                  setSelectedPath(c.path);
                  loadFile(c.path);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                  selectedPath === c.path
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] uppercase text-slate-500">{c.type}</span>
              </button>
            ))}
          </div>

          {/* Validation Status Card */}
          <div className="pt-4 border-t border-slate-800/80">
            {validation.valid ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">YAML Syntax Valid</span>
              </div>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1 text-red-400 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  YAML Error Detected
                </div>
                {validation.line && (
                  <p className="text-[11px] font-mono">
                    At Line: <span className="font-bold underline">{validation.line}</span>
                  </p>
                )}
                <p className="text-[11px] text-red-300 line-clamp-3 leading-tight">{validation.error}</p>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Warnings ({validation.warnings.length})
                </div>
                {validation.warnings.map((w, i) => (
                  <p key={i} className="line-clamp-2">{w}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 3 Cols: Code Editor Area */}
        <div className="lg:col-span-3 bg-[#0b0f19] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
          <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Editing: <span className="text-cyan-400 font-bold">{selectedPath}</span></span>
            {saveStatus && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveStatus}
              </span>
            )}
          </div>

          <textarea
            value={fileContent}
            onChange={handleContentChange}
            spellCheck={false}
            className="flex-1 min-h-[500px] p-5 bg-[#070b12] font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed terminal-scroll select-text"
          />
        </div>
      </div>
    </div>
  );
};
