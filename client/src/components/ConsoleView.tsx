import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, ArrowDownCircle, Search, Bug, Terminal as TerminalIcon } from 'lucide-react';
import { ansiToHtml } from '../utils/ansi';

interface ConsoleViewProps {
  logs: string[];
  onSendCommand: (cmd: string) => void;
  onClearLogs: () => void;
  onTriggerTestError: () => void;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({
  logs,
  onSendCommand,
  onClearLogs,
  onTriggerTestError
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim();
    if (!trimmed) return;

    onSendCommand(trimmed);
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      }
    }
  };

  const filteredLogs = filterText
    ? logs.filter(line => line.toLowerCase().includes(filterText.toLowerCase()))
    : logs;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-[#0b0f19] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Console Top Toolbar */}
      <div className="h-12 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">Server Interactive Terminal</span>
          <span className="text-[11px] font-mono text-slate-400">({logs.length} lines)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs (e.g. AquaFishing, ERROR)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-56 font-mono"
            />
          </div>

          {/* Test Error Button */}
          <button
            onClick={onTriggerTestError}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border border-amber-600/40 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            title="Inject an exception stack trace into the server console to test the Bug Hunter AI triage engine"
          >
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            Trigger Test Error
          </button>

          {/* Auto scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
              autoScroll
                ? 'bg-cyan-950 text-cyan-400 border-cyan-700/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
          >
            <ArrowDownCircle className="w-4 h-4" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 cursor-pointer transition-all"
            title="Clear Terminal View"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-0.5 terminal-scroll select-text leading-relaxed bg-[#070b12]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            No terminal output yet. Start the server to see real-time Paper logs.
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="hover:bg-slate-900/30 px-1 py-0.5 rounded transition-colors"
              dangerouslySetInnerHTML={{ __html: ansiToHtml(log) }}
            />
          ))
        )}
      </div>

      {/* Quick Command Suggestions */}
      <div className="px-4 py-1.5 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 font-sans text-xs">Quick:</span>
        {['tps', 'spark tps', 'plugins', 'reload confirm', 'memory'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => onSendCommand(cmd)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950/60 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all cursor-pointer whitespace-nowrap"
          >
            /{cmd}
          </button>
        ))}
      </div>

      {/* Command Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 bg-black/60 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-cyan-500/50">
          <span className="text-cyan-400 font-mono font-bold">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a server command (e.g. tps, help, gamemode survival)..."
            className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
