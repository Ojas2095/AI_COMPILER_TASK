"use client";

import React, { useState, useRef, useEffect } from "react";
import RuntimeRenderer from "./RuntimeRenderer";

/* ─── Stage Metadata ─── */
const STAGE_META: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  intent:     { label: "Intent Extraction",       icon: "🎯", color: "#3b82f6", desc: "Parsing entities, roles, and assumptions" },
  design:     { label: "System Design",           icon: "🏗️", color: "#8b5cf6", desc: "Mapping architecture, pages, and tables" },
  app_config: { label: "Schema Generation",       icon: "⚙️", color: "#a855f7", desc: "Building UI, DB, API, and auth layers" },
  refinement: { label: "Cross-Layer Refinement",  icon: "✅", color: "#10b981", desc: "Semantic consistency validation" },
};

const EXAMPLE_PROMPTS = [
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments.",
  "A medical scheduling app where doctors set availability and patients book appointments.",
  "E-commerce store with shopping cart, product search, and admin dashboard.",
  "Task management tool for agile teams with Kanban boards and sprints.",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "runtime">("pipeline");
  const [currentStage, setCurrentStage] = useState(-1);
  const logEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll log panel */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, currentStage]);

  /* ─── Simulated stage progression while waiting ─── */
  const simulateStages = () => {
    const stages = ["intent", "design", "app_config", "refinement"];
    stages.forEach((_, i) => {
      setTimeout(() => setCurrentStage(i), i * 2800 + 500);
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setLogs([]);
    setConfig(null);
    setMetadata(null);
    setError("");
    setCurrentStage(-1);
    simulateStages();

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
      setCurrentStage(4); // all done
      setActiveTab("runtime");
    } catch (err: any) {
      setError(err.message);
      setCurrentStage(-1);
    } finally {
      setLoading(false);
    }
  };

  const stageKeys = ["intent", "design", "app_config", "refinement"];

  return (
    <main className="flex flex-col min-h-screen gradient-bg">
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="glass border-b px-6 py-3.5 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black pulse-glow"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
            >
              λ
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: '#10b981', borderColor: 'var(--bg-secondary)' }} />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text" style={{ letterSpacing: '-0.01em' }}>AI Software Compiler</h1>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-dim)' }}>Natural Language → Validated Config → Executable App</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">
            <span className="w-1.5 h-1.5 rounded-full glow-dot" style={{ background: '#10b981' }} />
            Gemini 2.0 Flash
          </span>
          <span className="badge badge-purple">
            4-Stage Pipeline
          </span>
        </div>
      </header>

      {/* ═══════════════════ MAIN LAYOUT ═══════════════════ */}
      <div className="flex flex-1 flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 57px)' }}>

        {/* ─── LEFT PANEL: Input + Pipeline Logs ─── */}
        <div className="w-full md:w-[460px] flex flex-col border-r overflow-y-auto" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>

          {/* Prompt Input */}
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Natural Language Input
              </label>
              <span className="text-[10px] font-mono" style={{ color: prompt.length > 200 ? 'var(--warning)' : 'var(--text-dim)' }}>
                {prompt.length}/500
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              className="input-field w-full h-28 p-3 text-sm resize-none"
              placeholder='e.g., "Build a CRM with login, contacts, dashboard, role-based access, and premium plan..."'
            />
            {/* Example Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="text-[9px] px-2 py-1 rounded-md transition-all hover:scale-105"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {ex.substring(0, 40)}...
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="btn-primary mt-3 w-full py-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Compiling Pipeline...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Compile Application
                </span>
              )}
            </button>

            {error && (
              <div className="mt-3 p-3 rounded-lg text-xs animate-fade-scale" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)' }}>
                <span className="font-semibold">⚠ Pipeline Error:</span> {error}
              </div>
            )}
          </div>

          {/* Cost & Metrics */}
          {metadata && (
            <div className="p-4 border-b animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Pipeline Metrics
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: `${metadata.total_latency_seconds}s`, label: "Latency", color: "#10b981" },
                  { val: metadata.cost?.total_input_tokens?.toLocaleString() || "0", label: "Tokens In", color: "#a855f7" },
                  { val: `$${metadata.cost?.total_cost_usd || '0.00'}`, label: "Est. Cost", color: "#3b82f6" },
                ].map(({ val, label, color }) => (
                  <div key={label} className="glass-card rounded-lg p-3 text-center">
                    <div className="text-lg font-bold count-up" style={{ color }}>{val}</div>
                    <div className="text-[9px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Token Breakdown */}
              {metadata.cost?.breakdown?.length > 0 && (
                <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div className="text-[9px] font-bold uppercase mb-2" style={{ color: 'var(--text-dim)' }}>Per-Stage Cost</div>
                  {metadata.cost.breakdown.map((b: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[10px] py-0.5">
                      <span style={{ color: 'var(--text-secondary)' }}>{b.stage}</span>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {b.input_tokens}+{b.output_tokens} tok · ${b.cost_usd}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Assumptions */}
              {metadata.intent?.assumptions?.length > 0 && (
                <div className="mt-3 glass-card rounded-lg p-3 text-xs" style={{ borderColor: 'var(--warning-border)' }}>
                  <div className="font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--warning)' }}>
                    <span>💡</span> Assumptions Made
                  </div>
                  <ul className="list-disc pl-4 flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {metadata.intent.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {metadata.intent?.has_conflicts && (
                <div className="mt-2 glass-card rounded-lg p-3 text-xs" style={{ borderColor: 'var(--error-border)' }}>
                  <div className="font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--error)' }}>
                    <span>⚡</span> Conflicts Resolved
                  </div>
                  <ul className="list-disc pl-4 flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {metadata.intent.conflict_resolution?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Pipeline Execution Log */}
          <div className="p-5 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Pipeline Execution
            </div>

            {/* Stage Progress Tracker (always visible when loading) */}
            {(loading || logs.length > 0) && (
              <div className="flex flex-col gap-0 mb-4">
                {stageKeys.map((key, i) => {
                  const meta = STAGE_META[key];
                  const stageLog = logs.find((l: any) => l.stage === key);
                  const isActive = loading && currentStage === i;
                  const isDone = stageLog || currentStage > i;
                  const hasError = stageLog?.logs?.some((l: any) => l.status !== 'success' && l.status !== 'skipped');
                  const isPending = !isDone && !isActive;

                  return (
                    <div key={key}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'stage-enter' : ''}`}
                        style={{
                          background: isActive ? 'rgba(124, 58, 237, 0.08)' : isDone ? 'transparent' : 'transparent',
                          border: isActive ? '1px solid rgba(124, 58, 237, 0.15)' : '1px solid transparent',
                          opacity: isPending && loading ? 0.35 : 1,
                        }}
                      >
                        {/* Stage Icon */}
                        <div className="relative">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'pulse-glow' : ''}`}
                            style={{
                              background: isDone ? `${meta.color}15` : isActive ? `${meta.color}25` : 'var(--bg-card)',
                              color: isDone || isActive ? meta.color : 'var(--text-dim)',
                              border: `1px solid ${isDone || isActive ? `${meta.color}30` : 'var(--border-color)'}`,
                            }}
                          >
                            {isDone && !isActive ? '✓' : meta.icon}
                          </div>
                          {isActive && (
                            <div className="absolute inset-0 rounded-lg orbital-spin" style={{ border: '2px solid transparent', borderTopColor: meta.color, opacity: 0.6 }} />
                          )}
                        </div>

                        {/* Stage Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold" style={{ color: isDone || isActive ? meta.color : 'var(--text-dim)' }}>
                            {meta.label}
                          </div>
                          <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                            {isActive ? (
                              <span className="flex items-center gap-1.5">
                                Processing
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                                <span className="typing-dot" />
                              </span>
                            ) : isDone ? (
                              hasError ? 'Completed with retries' : 'Completed'
                            ) : (
                              meta.desc
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isDone && !isActive && (
                          <span className={`badge ${hasError ? 'badge-warning' : 'badge-success'}`}>
                            {hasError ? 'RETRY' : 'PASS'}
                          </span>
                        )}
                        {isActive && (
                          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${meta.color}30`, borderTopColor: meta.color }} />
                        )}
                      </div>

                      {/* Connector */}
                      {i < stageKeys.length - 1 && (
                        <div className="flex justify-start pl-6">
                          <div className="w-px h-4" style={{ background: isDone ? `${meta.color}30` : 'var(--border-color)' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Logs (after completion) */}
            {logs.length > 0 && !loading && (
              <div className="mt-2">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
                  Detailed Trace
                </div>
                {logs.map((stage: any, i: number) => {
                  const meta = STAGE_META[stage.stage] || { label: stage.stage, icon: "?", color: "#64748b" };
                  return (
                    <div key={i} className="mb-3 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs" style={{ color: meta.color }}>{meta.icon}</span>
                        <span className="text-[10px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                      </div>
                      <div className="pl-5 border-l flex flex-col gap-1" style={{ borderColor: `${meta.color}20` }}>
                        {stage.logs?.map((lLog: any, k: number) => (
                          <div
                            key={k}
                            className="p-2 rounded-lg text-[10px] font-mono"
                            style={{
                              background: lLog.status === 'success' ? 'var(--success-bg)' : lLog.status === 'rate_limited' ? 'var(--warning-bg)' : 'var(--error-bg)',
                              border: `1px solid ${lLog.status === 'success' ? 'var(--success-border)' : lLog.status === 'rate_limited' ? 'var(--warning-border)' : 'var(--error-border)'}`,
                            }}
                          >
                            <div className="font-bold" style={{ color: lLog.status === 'success' ? 'var(--success)' : lLog.status === 'rate_limited' ? 'var(--warning)' : 'var(--error)' }}>
                              Attempt {lLog.attempt}: {lLog.status.toUpperCase()}
                            </div>
                            {lLog.status === 'success' && lLog.raw && (
                              <div className="mt-1 h-12 overflow-y-auto p-1.5 rounded text-[9px] break-all" style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-dim)' }}>
                                {typeof lLog.raw === 'string' ? lLog.raw.substring(0, 250) : 'Output validated.'}...
                              </div>
                            )}
                            {lLog.status !== 'success' && lLog.error && (
                              <div className="mt-0.5 text-[9px]" style={{ color: 'var(--error)' }}>
                                {lLog.error.substring(0, 180)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 glass-card" style={{ fontSize: '20px' }}>
                  λ
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Pipeline Idle</div>
                <div className="text-[10px] max-w-[200px]" style={{ color: 'var(--text-dim)' }}>
                  Enter a prompt to begin compilation
                </div>
              </div>
            )}

            <div ref={logEndRef} />
          </div>
        </div>

        {/* ─── RIGHT PANEL: Runtime Preview ─── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          {/* Tab Bar */}
          <div className="flex border-b px-4 glass" style={{ borderColor: 'var(--border-color)' }}>
            {[
              { key: "pipeline" as const, label: "Architecture View", icon: "🏗️" },
              { key: "runtime" as const, label: "Runtime Simulation", icon: "▶️" },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="px-4 py-2.5 text-xs font-semibold transition-all flex items-center gap-1.5 relative"
                style={{
                  color: activeTab === key ? 'var(--accent-secondary)' : 'var(--text-dim)',
                }}
              >
                <span className="text-[11px]">{icon}</span>
                {label}
                {activeTab === key && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
                )}
              </button>
            ))}
            {config && (
              <div className="ml-auto flex items-center gap-1.5 py-2">
                <span className="badge badge-success text-[9px]">● Live</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {config ? (
              <RuntimeRenderer config={config} activeTab={activeTab} metadata={metadata} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="glass-card w-24 h-24 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-10 h-10" style={{ color: 'var(--text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="text-sm font-bold mb-1.5 gradient-text">Awaiting Compilation</div>
                <div className="text-xs text-center max-w-xs" style={{ color: 'var(--text-dim)' }}>
                  Enter a natural language prompt and the compiler will generate a validated, executable application schema.
                </div>
                <div className="mt-6 flex gap-3">
                  {["Pages", "Tables", "APIs", "Auth"].map((item) => (
                    <div key={item} className="glass-card px-3 py-2 rounded-lg text-center">
                      <div className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>—</div>
                      <div className="text-[9px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
