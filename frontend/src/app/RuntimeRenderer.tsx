"use client";

import React, { useState, useCallback } from "react";

/* ─── Mock Data Generator ─── */
const MOCK_NAMES = ["Alice Chen", "Bob Smith", "Carol Davis", "Dan Wilson", "Eva Martinez", "Frank Lee", "Grace Kim", "Henry Patel"];
const MOCK_EMAILS = MOCK_NAMES.map(n => n.toLowerCase().replace(' ', '.') + "@example.com");
const MOCK_PHONES = ["+1-555-0101", "+1-555-0202", "+1-555-0303", "+1-555-0404", "+1-555-0505", "+1-555-0606", "+1-555-0707", "+1-555-0808"];
const MOCK_PLANS = ["free", "premium", "enterprise", "free", "premium", "free", "enterprise", "premium"];

function mockValue(field: string, row: number): string {
  const f = field.toLowerCase();
  if (f === "id") return `${1000 + row}`;
  if (f === "name" || f === "first_name") return MOCK_NAMES[row % MOCK_NAMES.length].split(' ')[0];
  if (f === "last_name") return MOCK_NAMES[row % MOCK_NAMES.length].split(' ')[1];
  if (f === "email") return MOCK_EMAILS[row % MOCK_EMAILS.length];
  if (f === "phone") return MOCK_PHONES[row % MOCK_PHONES.length];
  if (f === "plan") return MOCK_PLANS[row % MOCK_PLANS.length];
  if (f === "total_revenue") return `$${(Math.random() * 50000 + 10000).toFixed(0)}`;
  if (f === "active_users") return `${Math.floor(Math.random() * 500 + 100)}`;
  if (f.includes("date") || f.includes("time")) return "2026-04-30";
  if (f.includes("status")) return ["active", "pending", "inactive"][row % 3];
  if (f.includes("role")) return ["admin", "user", "editor"][row % 3];
  return `${field}_${row + 1}`;
}

/* ─── Toast System ─── */
function Toast({ message, type, onClose }: { message: string; type: string; onClose: () => void }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  const colors: Record<string, string> = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const icons: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div className="toast-enter flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium" style={{
      background: 'var(--bg-elevated)', border: `1px solid ${colors[type]}30`, color: colors[type],
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${colors[type]}15`
    }}>
      <span className="font-bold">{icons[type]}</span> {message}
    </div>
  );
}

export default function RuntimeRenderer({ config, activeTab, metadata }: any) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState(0);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);

  const addToast = useCallback((msg: string, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!config) return <div style={{ color: 'var(--text-dim)' }} className="italic p-4 text-sm">No config loaded.</div>;

  // ═══════════════════════════════════════════
  // ARCHITECTURE VIEW
  // ═══════════════════════════════════════════
  if (activeTab === "pipeline") {
    return (
      <div className="flex flex-col gap-6">
        {/* App Header Card */}
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text mb-1">{config.app_name}</h1>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>Generated Architecture Overview</p>
            </div>
            <span className="badge badge-success">Compiled</span>
          </div>
          <div className="flex gap-6 mt-4">
            {[
              { n: config.pages?.length || 0, l: "Pages", c: "#a855f7", icon: "📄" },
              { n: config.database_tables?.length || 0, l: "Tables", c: "#3b82f6", icon: "🗄️" },
              { n: config.api_endpoints?.length || 0, l: "APIs", c: "#10b981", icon: "🔌" },
              { n: config.auth_rules?.length || 0, l: "Roles", c: "#f59e0b", icon: "🔐" },
              { n: config.business_rules?.length || 0, l: "Rules", c: "#ec4899", icon: "⚡" },
            ].map(({ n, l, c, icon }) => (
              <div key={l} className="text-center">
                <div className="text-[11px] mb-0.5">{icon}</div>
                <div className="text-xl font-bold count-up" style={{ color: c }}>{n}</div>
                <div className="text-[9px] uppercase font-semibold" style={{ color: 'var(--text-dim)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Schema */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#3b82f6' }}>
            <span>🗄️</span> Database Schema
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {config.database_tables?.map((dt: any, idx: number) => (
              <div key={dt.name} className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${idx * 60}ms`, borderColor: 'rgba(59,130,246,0.1)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-sm font-bold" style={{ color: '#3b82f6' }}>{dt.name}</span>
                  <span className="badge badge-info text-[8px]">{dt.columns?.length} cols</span>
                </div>
                <div className="flex flex-col gap-1">
                  {dt.columns?.map((col: any) => (
                    <div key={col.name} className="flex items-center gap-2 text-[10px] px-2 py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{col.name}</span>
                      <span className="badge-purple badge text-[8px]">{col.type}</span>
                      {col.primary_key && <span className="badge badge-warning text-[8px]">PK</span>}
                      {col.relations && <span className="text-[9px]" style={{ color: '#10b981' }}>→ {col.relations}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
            <span>🔌</span> API Endpoints
          </h3>
          <div className="flex flex-col gap-2">
            {config.api_endpoints?.map((api: any, i: number) => {
              const mKey = `method-${api.method?.toLowerCase()}`;
              return (
                <div key={i} className="glass-card rounded-lg p-3 flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className={`badge ${mKey} text-[9px] font-bold font-mono mt-0.5`}>{api.method}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{api.path}</span>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{api.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {api.requires_auth && <span className="badge badge-warning text-[8px]">AUTH</span>}
                      {api.roles_allowed?.map((r: string) => <span key={r} className="badge badge-purple text-[8px]">{r}</span>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auth Rules */}
        {config.auth_rules?.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
              <span>🔐</span> Auth & Permission Matrix
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {config.auth_rules.map((rule: any, i: number) => (
                <div key={i} className="glass-card rounded-xl p-4" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
                  <div className="font-bold text-sm mb-2.5 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]" style={{ background: 'rgba(245,158,11,0.12)' }}>👤</span>
                    {rule.role}
                  </div>
                  <div className="flex flex-col gap-1.5 text-[10px]">
                    <div><span style={{ color: 'var(--text-dim)' }}>Pages:</span> <span style={{ color: 'var(--text-secondary)' }}>{rule.can_access_pages?.join(', ')}</span></div>
                    <div><span style={{ color: 'var(--text-dim)' }}>APIs:</span> <span style={{ color: 'var(--text-secondary)' }}>{rule.can_call_apis?.join(', ')}</span></div>
                    {rule.special_permissions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.special_permissions.map((p: string) => <span key={p} className="badge badge-success text-[8px]">{p}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Rules */}
        {config.business_rules?.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#ec4899' }}>
              <span>⚡</span> Business Logic Rules
            </h3>
            {config.business_rules.map((rule: any, i: number) => (
              <div key={i} className="glass-card rounded-lg p-4 mb-2" style={{ borderColor: 'rgba(236,72,153,0.1)' }}>
                <div className="font-bold text-xs mb-1" style={{ color: '#ec4899' }}>{rule.name}</div>
                <div className="text-[10px] mb-2" style={{ color: 'var(--text-secondary)' }}>{rule.description}</div>
                <div className="text-[10px] font-mono px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>IF </span>
                  <span style={{ color: '#f59e0b' }}>{rule.condition}</span>
                  <span style={{ color: 'var(--text-dim)' }}> THEN </span>
                  <span style={{ color: '#10b981' }}>{rule.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RUNTIME SIMULATION TAB
  // ═══════════════════════════════════════════
  const pages = config.pages || [];
  const currentPage = pages[activePage] || pages[0];

  return (
    <div className="flex gap-4 relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => <Toast key={t.id} message={t.msg} type={t.type} onClose={() => removeToast(t.id)} />)}
      </div>

      {/* Navigation Sidebar */}
      <div className="w-48 flex-shrink-0 glass-card rounded-xl p-3 h-fit sticky top-0">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-dim)' }}>
          App Navigation
        </div>
        {/* Role Selector */}
        <div className="mb-3 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="text-[9px] uppercase font-bold mb-1.5" style={{ color: 'var(--text-dim)' }}>Logged in as</div>
          <select
            value={loggedInRole || ''}
            onChange={(e) => { setLoggedInRole(e.target.value || null); setActivePage(0); }}
            className="w-full text-[10px] px-2 py-1 rounded-md input-field"
          >
            <option value="">Guest</option>
            {config.auth_rules?.map((r: any) => <option key={r.role} value={r.role}>{r.role}</option>)}
          </select>
        </div>
        {/* Page Links */}
        {pages.map((page: any, idx: number) => {
          const locked = page.requires_auth && !loggedInRole;
          const roleBlocked = page.roles_allowed?.length > 0 && loggedInRole && !page.roles_allowed.includes(loggedInRole);
          return (
            <button
              key={idx}
              onClick={() => { if (locked) { addToast("Login required to access this page", "error"); return; } if (roleBlocked) { addToast(`Role "${loggedInRole}" cannot access ${page.route}`, "error"); return; } setActivePage(idx); }}
              className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all mb-1 flex items-center justify-between"
              style={{
                background: activePage === idx ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: activePage === idx ? 'var(--accent-secondary)' : locked || roleBlocked ? 'var(--text-dim)' : 'var(--text-secondary)',
                border: activePage === idx ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                opacity: locked || roleBlocked ? 0.5 : 1,
              }}
            >
              <span className="truncate">{page.title}</span>
              {locked && <span className="text-[8px]">🔒</span>}
              {roleBlocked && <span className="text-[8px]">🚫</span>}
            </button>
          );
        })}
      </div>

      {/* Page Content */}
      <div className="flex-1 min-w-0">
        <div className="glass-card rounded-xl overflow-hidden animate-fade-scale">
          {/* Browser Chrome */}
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
              </div>
              <div className="ml-3 px-3 py-1 rounded-md text-[10px] font-mono" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}>
                {config.app_name?.toLowerCase().replace(/\s/g, '')}.app{currentPage?.route}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentPage?.requires_auth && <span className="badge badge-warning text-[8px]">AUTH</span>}
              {currentPage?.roles_allowed?.map((r: string) => <span key={r} className="badge badge-purple text-[8px]">{r}</span>)}
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentPage?.title}</h2>

            {currentPage?.components?.map((comp: any, cIdx: number) => (
              <div key={cIdx} className="rounded-xl p-5 relative animate-fade-in" style={{ animationDelay: `${cIdx * 80}ms`, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <span className="absolute top-3 right-3 badge badge-purple text-[8px]">{comp.type}: {comp.name}</span>

                {/* FORM */}
                {comp.type === 'form' && (
                  <form className="flex flex-col gap-3 mt-6" onSubmit={(e) => { e.preventDefault(); addToast(`${comp.name} submitted successfully!`, "success"); setFormState({}); }}>
                    {comp.fields?.map((field: string) => (
                      <div key={field}>
                        <label className="text-[10px] uppercase font-bold block mb-1.5" style={{ color: 'var(--text-muted)' }}>{field.replace(/_/g, ' ')}</label>
                        <input
                          value={formState[`${comp.name}_${field}`] || ''}
                          onChange={(e) => setFormState(prev => ({ ...prev, [`${comp.name}_${field}`]: e.target.value }))}
                          type={field.toLowerCase().includes('password') ? 'password' : field.toLowerCase().includes('email') ? 'email' : 'text'}
                          placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                          className="input-field w-full px-3 py-2.5 rounded-lg text-xs"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      {comp.actions?.map((act: string) => (
                        <button key={act} type={act === 'submit' ? 'submit' : 'button'} className="btn-primary px-5 py-2.5 text-xs"
                          onClick={act !== 'submit' ? () => addToast(`${act} action triggered`, "info") : undefined}
                        >
                          {act.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {/* TABLE */}
                {comp.type === 'table' && (
                  <div className="overflow-x-auto mt-6">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          {comp.fields?.map((field: string) => (
                            <th key={field} className="px-3 py-2.5 text-left text-[10px] uppercase font-bold" style={{ color: 'var(--text-dim)' }}>{field.replace(/_/g, ' ')}</th>
                          ))}
                          <th className="px-3 py-2.5 text-left text-[10px] uppercase font-bold" style={{ color: 'var(--text-dim)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1, 2, 3, 4].map(row => (
                          <tr key={row} className="transition-colors" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.03)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {comp.fields?.map((field: string) => (
                              <td key={field} className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>
                                {field.toLowerCase() === 'plan' ? (
                                  <span className={`badge ${mockValue(field, row) === 'premium' ? 'badge-success' : mockValue(field, row) === 'enterprise' ? 'badge-purple' : 'badge-info'} text-[8px]`}>
                                    {mockValue(field, row)}
                                  </span>
                                ) : field.toLowerCase().includes('status') ? (
                                  <span className={`badge ${mockValue(field, row) === 'active' ? 'badge-success' : mockValue(field, row) === 'pending' ? 'badge-warning' : 'badge-error'} text-[8px]`}>
                                    {mockValue(field, row)}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[11px]">{mockValue(field, row)}</span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1">
                                {comp.actions?.map((act: string) => (
                                  <button key={act} onClick={() => addToast(`${act} on row ${row + 1}`, act === 'delete' ? 'error' : 'info')}
                                    className="px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all hover:scale-105"
                                    style={{ background: act === 'delete' ? 'var(--error-bg)' : 'rgba(124,58,237,0.08)', color: act === 'delete' ? 'var(--error)' : 'var(--accent-secondary)', border: `1px solid ${act === 'delete' ? 'var(--error-border)' : 'rgba(124,58,237,0.15)'}` }}
                                  >{act}</button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* HERO / DASHBOARD WIDGET */}
                {comp.type === 'hero' && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {comp.fields?.map((field: string, fi: number) => (
                      <div key={field} className="glass-card rounded-lg p-4 text-center">
                        <div className="text-[10px] uppercase font-bold mb-1" style={{ color: 'var(--text-dim)' }}>{field.replace(/_/g, ' ')}</div>
                        <div className="text-2xl font-bold count-up" style={{ color: fi % 2 === 0 ? '#a855f7' : '#10b981' }}>
                          {field.includes('revenue') ? '$47,250' : field.includes('user') ? '342' : mockValue(field, 0)}
                        </div>
                        <div className="text-[9px] mt-1" style={{ color: '#10b981' }}>▲ {(Math.random() * 20 + 5).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* GENERIC COMPONENT */}
                {!['form', 'table', 'hero'].includes(comp.type) && (
                  <div className="mt-6 text-center p-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '2px dashed rgba(124,58,237,0.15)' }}>
                    <div className="font-bold text-sm gradient-text">[{comp.name}]</div>
                    <div className="text-[10px] mt-1.5" style={{ color: 'var(--text-dim)' }}>Type: {comp.type} · Fields: {comp.fields?.join(', ')}</div>
                    {comp.actions?.length > 0 && (
                      <div className="flex gap-2 justify-center mt-3">
                        {comp.actions.map((a: string) => <button key={a} onClick={() => addToast(`${a} triggered`, 'info')} className="btn-primary px-3 py-1.5 text-[10px]">{a}</button>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
