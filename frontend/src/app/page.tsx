"use client";

import React, { useState } from "react";
import RuntimeRenderer from "./RuntimeRenderer";

const STAGE_META: Record<string, { label: string; icon: string; color: string }> = {
  intent: { label: "Intent Extraction", icon: "1", color: "#3b82f6" },
  design: { label: "System Design", icon: "2", color: "#8b5cf6" },
  app_config: { label: "Schema Generation", icon: "3", color: "#a855f7" },
  refinement: { label: "Cross-Layer Refinement", icon: "4", color: "#10b981" },
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "runtime">("pipeline");

  const handleGenerate = async () => {
    setLoading(true);
    setLogs([]);
    setConfig(null);
    setMetadata(null);
    setError("");

    try {
      const res = await fetch("http://localhost:8001/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unknown error");
      setLogs(data.logs);
      setConfig(data.config);
      setMetadata(data.metadata);
      setActiveTab("runtime");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen" style={{ background: '#0a0a0f', color: '#e2e8f0' }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(148,163,184,0.1)', background: '#12121a' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
            AI
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>AI Software Compiler</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>Natural Language &rarr; Validated Config &rarr; Executable App</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
            Gemini 2.5 Flash
          </span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'rgba(124,58,237,0.15)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.3)' }}>
            4-Stage Pipeline
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 65px)' }}>
        {/* Left Panel: Input + Logs */}
        <div className="w-full md:w-[480px] flex flex-col border-r overflow-y-auto" style={{ borderColor: 'rgba(148,163,184,0.1)', background: '#12121a' }}>
          {/* Input Section */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#64748b' }}>
              Natural Language Input
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-28 rounded-lg p-3 text-sm resize-none focus:outline-none transition-all"
              style={{
                background: '#1a1a2e',
                border: '1px solid rgba(148,163,184,0.15)',
                color: '#e2e8f0',
                fontFamily: 'Inter, sans-serif'
              }}
              placeholder='e.g., "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments."'
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="mt-3 w-full py-3 rounded-lg font-semibold text-sm transition-all"
              style={{
                background: loading ? '#4a4a5a' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: (!prompt.trim() && !loading) ? 0.5 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Compiling Pipeline...
                </span>
              ) : (
                "Compile Application"
              )}
            </button>

            {error && (
              <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                {error}
              </div>
            )}
          </div>

          {/* Cost & Metadata Panel */}
          {metadata && (
            <div className="p-4 border-b" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
                Pipeline Metrics
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg p-3 text-center" style={{ background: '#1a1a2e' }}>
                  <div className="text-lg font-bold" style={{ color: '#10b981' }}>{metadata.total_latency_seconds}s</div>
                  <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Latency</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: '#1a1a2e' }}>
                  <div className="text-lg font-bold" style={{ color: '#a855f7' }}>{metadata.cost?.total_input_tokens || 0}</div>
                  <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Tokens In</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: '#1a1a2e' }}>
                  <div className="text-lg font-bold" style={{ color: '#3b82f6' }}>${metadata.cost?.total_cost_usd || '0.00'}</div>
                  <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Est. Cost</div>
                </div>
              </div>

              {/* Assumptions & Conflicts */}
              {metadata.intent?.assumptions?.length > 0 && (
                <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="font-semibold mb-1" style={{ color: '#f59e0b' }}>Assumptions Made:</div>
                  <ul className="list-disc pl-4" style={{ color: '#94a3b8' }}>
                    {metadata.intent.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {metadata.intent?.has_conflicts && (
                <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="font-semibold mb-1" style={{ color: '#ef4444' }}>Conflicts Resolved:</div>
                  <ul className="list-disc pl-4" style={{ color: '#94a3b8' }}>
                    {metadata.intent.conflict_resolution?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Pipeline Logs */}
          <div className="p-5 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
              Pipeline Execution Log
            </div>
            {logs.map((stage: any, i: number) => {
              const meta = STAGE_META[stage.stage] || { label: stage.stage, icon: "?", color: "#64748b" };
              return (
                <div key={i} className="mb-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: meta.color }}>
                      {meta.icon}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                    {stage.logs?.every((l: any) => l.status === 'success' || l.status === 'skipped') && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>PASS</span>
                    )}
                  </div>
                  <div className="pl-5 border-l flex flex-col gap-1.5" style={{ borderColor: `${meta.color}33` }}>
                    {stage.logs?.map((lLog: any, k: number) => (
                      <div key={k} className="p-2.5 rounded-lg text-xs font-mono" style={{
                        background: lLog.status === 'success' ? 'rgba(16,185,129,0.06)' : lLog.status === 'skipped' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${lLog.status === 'success' ? 'rgba(16,185,129,0.15)' : lLog.status === 'skipped' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}>
                        <div className="font-semibold mb-1" style={{ color: lLog.status === 'success' ? '#10b981' : lLog.status === 'skipped' ? '#f59e0b' : '#ef4444' }}>
                          Attempt {lLog.attempt}: {lLog.status.toUpperCase()}
                        </div>
                        {lLog.status === 'success' && (
                          <div className="h-16 overflow-y-auto p-1.5 rounded text-[10px] break-all" style={{ background: 'rgba(0,0,0,0.3)', color: '#64748b' }}>
                            {lLog.raw?.substring(0, 300)}...
                          </div>
                        )}
                        {lLog.status !== 'success' && lLog.error && (
                          <div className="text-[10px]" style={{ color: '#ef4444' }}>{lLog.error.substring(0, 200)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-xs mt-2" style={{ color: '#a855f7' }}>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#a855f7' }}></span>
                Processing through pipeline stages...
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Runtime Preview */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0a0a0f' }}>
          {/* Tab Bar */}
          <div className="flex border-b px-4" style={{ borderColor: 'rgba(148,163,184,0.1)', background: '#12121a' }}>
            <button
              onClick={() => setActiveTab("pipeline")}
              className="px-4 py-2.5 text-xs font-semibold transition-all"
              style={{
                color: activeTab === 'pipeline' ? '#a855f7' : '#64748b',
                borderBottom: activeTab === 'pipeline' ? '2px solid #a855f7' : '2px solid transparent',
              }}
            >
              Architecture View
            </button>
            <button
              onClick={() => setActiveTab("runtime")}
              className="px-4 py-2.5 text-xs font-semibold transition-all"
              style={{
                color: activeTab === 'runtime' ? '#a855f7' : '#64748b',
                borderBottom: activeTab === 'runtime' ? '2px solid #a855f7' : '2px solid transparent',
              }}
            >
              Runtime Simulation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {config ? (
              <RuntimeRenderer config={config} activeTab={activeTab} metadata={metadata} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ color: '#64748b' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)' }}>
                  <svg className="w-10 h-10" style={{ color: '#4a4a5a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
                <div className="text-sm font-semibold mb-1">Awaiting Compilation</div>
                <div className="text-xs text-center max-w-xs" style={{ color: '#4a4a5a' }}>
                  Enter a natural language prompt and the compiler will generate a validated, executable application schema.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
