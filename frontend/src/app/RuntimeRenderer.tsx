"use client";

import React from "react";

export default function RuntimeRenderer({ config, activeTab, metadata }: any) {
  if (!config) return <div style={{ color: '#64748b' }} className="italic p-4 text-sm">No config ready to run.</div>;

  if (activeTab === "pipeline") {
    return (
      <div className="flex flex-col gap-6">
        {/* App Header */}
        <div className="rounded-xl p-5" style={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#e2e8f0' }}>{config.app_name}</h1>
          <p className="text-xs" style={{ color: '#64748b' }}>Generated Architecture Overview</p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#a855f7' }}>{config.pages?.length || 0}</div>
              <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Pages</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#3b82f6' }}>{config.database_tables?.length || 0}</div>
              <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Tables</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#10b981' }}>{config.api_endpoints?.length || 0}</div>
              <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>APIs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: '#f59e0b' }}>{config.auth_rules?.length || 0}</div>
              <div className="text-[10px] uppercase" style={{ color: '#64748b' }}>Roles</div>
            </div>
          </div>
        </div>

        {/* Database Tables */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#3b82f6' }}>Database Schema</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {config.database_tables?.map((dt: any) => (
              <div key={dt.name} className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid rgba(59,130,246,0.15)' }}>
                <span className="font-mono text-sm font-bold" style={{ color: '#3b82f6' }}>{dt.name}</span>
                <div className="mt-2 flex flex-col gap-1">
                  {dt.columns?.map((col: any) => (
                    <div key={col.name} className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono" style={{ color: '#e2e8f0' }}>{col.name}</span>
                      <span className="px-1 rounded" style={{ background: 'rgba(124,58,237,0.15)', color: '#a855f7', fontSize: '9px' }}>{col.type}</span>
                      {col.primary_key && <span style={{ color: '#f59e0b', fontSize: '9px' }}>PK</span>}
                      {col.relations && <span style={{ color: '#10b981', fontSize: '9px' }}>&rarr; {col.relations}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#10b981' }}>API Endpoints</h3>
          <div className="flex flex-col gap-2">
            {config.api_endpoints?.map((api: any, i: number) => (
              <div key={i} className="rounded-lg p-3 flex items-start gap-3" style={{ background: '#1a1a2e', border: '1px solid rgba(16,185,129,0.1)' }}>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{
                  background: api.method === 'GET' ? 'rgba(59,130,246,0.2)' : api.method === 'POST' ? 'rgba(16,185,129,0.2)' : api.method === 'PUT' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                  color: api.method === 'GET' ? '#3b82f6' : api.method === 'POST' ? '#10b981' : api.method === 'PUT' ? '#f59e0b' : '#ef4444',
                }}>
                  {api.method}
                </span>
                <div className="flex-1">
                  <span className="font-mono text-xs" style={{ color: '#e2e8f0' }}>{api.path}</span>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>{api.description}</p>
                  <div className="flex gap-2 mt-1">
                    {api.requires_auth && <span className="text-[9px] px-1 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>AUTH</span>}
                    {api.roles_allowed?.map((r: string) => (
                      <span key={r} className="text-[9px] px-1 rounded" style={{ background: 'rgba(124,58,237,0.15)', color: '#a855f7' }}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Rules */}
        {config.auth_rules?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#f59e0b' }}>Auth & Permission Rules</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {config.auth_rules.map((rule: any, i: number) => (
                <div key={i} className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="font-semibold text-sm mb-2" style={{ color: '#f59e0b' }}>{rule.role}</div>
                  <div className="text-[10px] mb-1" style={{ color: '#64748b' }}>Pages: <span style={{ color: '#94a3b8' }}>{rule.can_access_pages?.join(', ')}</span></div>
                  <div className="text-[10px] mb-1" style={{ color: '#64748b' }}>APIs: <span style={{ color: '#94a3b8' }}>{rule.can_call_apis?.join(', ')}</span></div>
                  {rule.special_permissions?.length > 0 && (
                    <div className="text-[10px]" style={{ color: '#64748b' }}>
                      Permissions: {rule.special_permissions.map((p: string) => (
                        <span key={p} className="px-1 rounded mr-1" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Rules */}
        {config.business_rules?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#ec4899' }}>Business Logic Rules</h3>
            {config.business_rules.map((rule: any, i: number) => (
              <div key={i} className="rounded-lg p-3 mb-2" style={{ background: '#1a1a2e', border: '1px solid rgba(236,72,153,0.15)' }}>
                <div className="font-semibold text-xs" style={{ color: '#ec4899' }}>{rule.name}</div>
                <div className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{rule.description}</div>
                <div className="text-[10px] mt-1 font-mono" style={{ color: '#64748b' }}>
                  IF <span style={{ color: '#f59e0b' }}>{rule.condition}</span> THEN <span style={{ color: '#10b981' }}>{rule.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // RUNTIME SIMULATION TAB
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-4" style={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)' }}>
        <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>{config.app_name}</h1>
        <p className="text-xs" style={{ color: '#64748b' }}>Runtime Simulation - Interactive Preview</p>
      </div>

      {config.pages?.map((page: any, pIdx: number) => (
        <div key={pIdx} className="rounded-xl overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.1)' }}>
          {/* Page Header Bar */}
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#16213e', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }}></div>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }}></div>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }}></div>
              </div>
              <span className="text-xs font-mono ml-2" style={{ color: '#94a3b8' }}>{page.route}</span>
            </div>
            <div className="flex items-center gap-2">
              {page.requires_auth && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>AUTH REQUIRED</span>}
              {page.roles_allowed?.map((r: string) => (
                <span key={r} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.15)', color: '#a855f7' }}>{r}</span>
              ))}
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>{page.title}</h2>
            {page.components?.map((comp: any, cIdx: number) => (
              <div key={cIdx} className="rounded-lg p-4 relative" style={{ background: '#0a0a0f', border: '1px solid rgba(148,163,184,0.08)' }}>
                <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.1)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.2)' }}>
                  {comp.type}: {comp.name}
                </span>

                {comp.type === 'form' && (
                  <form className="flex flex-col gap-3 mt-5" onSubmit={e => e.preventDefault()}>
                    {comp.fields?.map((field: string) => (
                      <div key={field}>
                        <label className="text-[10px] uppercase font-semibold block mb-1" style={{ color: '#64748b' }}>{field}</label>
                        <input
                          placeholder={`Enter ${field}...`}
                          className="w-full px-3 py-2 rounded-lg text-xs"
                          style={{ background: '#1a1a2e', border: '1px solid rgba(148,163,184,0.15)', color: '#e2e8f0' }}
                          disabled
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 mt-1">
                      {comp.actions?.map((act: string) => (
                        <button key={act} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}>
                          {act}
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {comp.type === 'table' && (
                  <div className="overflow-x-auto mt-5">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                          {comp.fields?.map((field: string) => (
                            <th key={field} className="px-3 py-2 text-left text-[10px] uppercase font-semibold" style={{ color: '#64748b' }}>{field}</th>
                          ))}
                          <th className="px-3 py-2 text-left text-[10px] uppercase font-semibold" style={{ color: '#64748b' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map(row => (
                          <tr key={row} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                            {comp.fields?.map((field: string) => (
                              <td key={field} className="px-3 py-2" style={{ color: '#94a3b8' }}>
                                <span className="px-2 py-0.5 rounded" style={{ background: '#1a1a2e' }}>sample_{field}_{row}</span>
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                {comp.actions?.map((act: string) => (
                                  <button key={act} className="px-2 py-1 rounded text-[10px]" style={{ background: '#1a1a2e', color: '#a855f7', border: '1px solid rgba(124,58,237,0.2)' }}>
                                    {act}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!['form', 'table'].includes(comp.type) && (
                  <div className="mt-5 text-center p-6 rounded-lg" style={{ background: '#1a1a2e', border: '2px dashed rgba(124,58,237,0.2)' }}>
                    <div className="font-bold text-sm" style={{ color: '#a855f7' }}>[{comp.name}]</div>
                    <div className="text-[10px] mt-1" style={{ color: '#64748b' }}>Fields: {comp.fields?.join(', ')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
