import React, { useState } from 'react';
import { Bug, CheckCircle2, Copy, Check, Download, AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronUp, Code2, Sparkles } from 'lucide-react';
import { DiagnosticReport } from '../types';

interface DiagnosticsViewProps {
  reports: DiagnosticReport[];
  onResolve: (id: string) => void;
  onClear: () => void;
  onTriggerTestError: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  reports,
  onResolve,
  onClear,
  onTriggerTestError
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(reports.length > 0 ? reports[0].id : null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    if (filterSeverity !== 'ALL' && r.severity !== filterSeverity) return false;
    return true;
  });

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleExportMarkdown = (report: DiagnosticReport) => {
    const md = `# AquaForge Bug Diagnostic Report
- **Error**: \`${report.errorType}\`
- **Plugin**: ${report.culpritPlugin || 'Server Core'}
- **Severity**: ${report.severity}
- **Timestamp**: ${report.timestamp}
- **Location**: \`${report.location?.fileName || 'unknown'}:${report.location?.lineNumber || '?'}\`

## Root Cause Analysis
${report.explanation}

## Recommended Code Fix
${report.recommendedFix}

\`\`\`java
${report.codeSnippet || '// No code snippet generated'}
\`\`\`

## Stack Trace
\`\`\`
${report.stackTrace.join('\n')}
\`\`\`
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaForge-BugReport-${report.culpritPlugin || 'Server'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: DiagnosticReport['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertOctagon className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0c1626] to-[#121c2e] rounded-2xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">Bug Hunter & AI Stack Trace Diagnostic Studio</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time Paper log listener that isolates failing plugins, decodes complex stack traces down to the exact source file and line, and generates production-ready Java code patches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerTestError}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            <Bug className="w-3.5 h-3.5" />
            Simulate Exception
          </button>
          <button
            onClick={onClear}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredReports.length} of {reports.length} exceptions
        </span>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1524] rounded-2xl border border-slate-800/80">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Zero Exceptions Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Server logs are currently healthy with no crashes or unhandled exceptions. Click "Simulate Exception" above to see the diagnostic studio in action!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  report.resolved
                    ? 'bg-slate-900/40 border-slate-800 opacity-70'
                    : 'bg-[#0e1524] border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                {/* Card Summary Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                      <Bug className="w-5 h-5 text-red-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(report.severity)}

                        {report.culpritPlugin && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Plugin: {report.culpritPlugin}
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </span>

                        {report.resolved && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            RESOLVED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-200 font-mono break-all">
                        {report.errorType}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{report.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {report.location && (
                      <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {report.location.fileName}:{report.location.lineNumber}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(report.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        report.resolved
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50 hover:bg-emerald-900/60'
                      }`}
                    >
                      {report.resolved ? 'Mark Unresolved' : 'Mark Fixed'}
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Detailed Diagnostic View */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-800 bg-[#090d16] space-y-6">
                    {/* Diagnostic Root Cause Card */}
                    <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Root Cause Diagnostic
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{report.explanation}</p>
                      <div className="text-xs text-slate-300 font-medium pt-1">
                        <span className="text-cyan-400 font-semibold">Recommended Solution:</span> {report.recommendedFix}
                      </div>
                    </div>

                    {/* Code Fix Recommendation Box */}
                    {report.codeSnippet && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <Code2 className="w-4 h-4 text-emerald-400" />
                            Suggested Java Patch ({report.location?.fileName || 'Plugin Source'})
                          </div>
                          <button
                            onClick={() => handleCopySnippet(report.codeSnippet!, report.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all cursor-pointer"
                          >
                            {copiedSnippetId === report.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Patch
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="p-4 bg-black/60 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto select-all leading-relaxed">
                          {report.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Stack Trace Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Full Stack Trace
                        </span>
                        <button
                          onClick={() => handleExportMarkdown(report)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export Report (.md)
                        </button>
                      </div>

                      <div className="p-4 bg-black/50 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1 max-h-64 terminal-scroll select-text">
                        {report.stackTrace.map((line, idx) => (
                          <div
                            key={idx}
                            className={
                              line.includes('com.efekoc') || (report.culpritPlugin && line.includes(report.culpritPlugin))
                                ? 'text-cyan-400 font-bold bg-cyan-950/40 px-1 rounded'
                                : 'text-slate-400'
                            }
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
