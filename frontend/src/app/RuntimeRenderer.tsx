"use client";

import React from "react";

export default function RuntimeRenderer({ config }) {
  if (!config) return <div className="text-gray-500 italic p-4">No config ready to run.</div>;

  return (
    <div className="w-full flex flex-col gap-6 p-4 bg-white text-black min-h-screen">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold">{config.app_name}</h1>
        <p className="text-sm text-gray-400 font-mono">Executable Runtime Simulation</p>
      </div>

      {config.pages?.map((page, pIdx) => (
        <div key={pIdx} className="mb-8 border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-gray-100 p-2 border-b border-gray-200 flex justify-between">
            <span className="font-semibold text-gray-700">{page.route} {page.requires_auth && '🔒'}</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 rounded-full hidden sm:block">
              {page.roles_allowed?.join(', ')}
            </span>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">{page.title}</h2>
            {page.components?.map((comp, cIdx) => (
              <div key={cIdx} className="border border-blue-200 rounded p-4 bg-blue-50/50 relative">
                <span className="absolute top-2 right-2 text-[10px] text-blue-500 font-monouppercase border border-blue-200 px-1 rounded">
                  {comp.type} : {comp.name}
                </span>

                {comp.type === 'form' && (
                  <form className="flex flex-col gap-3 mt-4" onSubmit={e => e.preventDefault()}>
                    {comp.fields?.map(field => (
                      <input key={field} placeholder={field} className="border p-2 rounded text-sm w-full max-w-sm" disabled />
                    ))}
                    <div className="flex gap-2">
                       {comp.actions?.map(act => (
                         <button key={act} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">{act}</button>
                       ))}
                    </div>
                  </form>
                )}

                {comp.type === 'table' && (
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          {comp.fields?.map(field => <th key={field} className="p-2 border-b text-left text-xs uppercase">{field}</th>)}
                          <th className="p-2 border-b text-left text-xs uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {comp.fields?.map(field => <td key={field} className="p-2 border-b text-sm text-gray-500">[{field} data]</td>)}
                          <td className="p-2 border-b text-sm">
                             <div className="flex gap-1">
                             {comp.actions?.map(act => (
                               <button key={act} className="bg-gray-200 px-2 py-1 rounded text-xs">{act}</button>
                             ))}
                             </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {!['form', 'table'].includes(comp.type) && (
                  <div className="mt-4 text-center p-8 bg-dashed border-2 border-dashed border-blue-300 rounded text-blue-600 font-bold text-xl">
                    [{comp.name}] <span className="text-sm font-normal">Fields: {comp.fields?.join(", ")}</span>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-bold mb-4">Simulated Backend Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border rounded-lg">
                 <h3 className="font-bold mb-2 text-indigo-700">Database Tables</h3>
                 {config.database_tables?.map(dt => (
                     <div key={dt.name} className="mb-2">
                        <span className="font-mono text-sm font-bold">{dt.name}</span>
                        <ul className="pl-4 list-disc text-xs text-gray-600">
                           {dt.columns?.map(col => <li key={col.name}>{col.name} ({col.type}) {col.relations ? '-> '+col.relations : ''}</li>)}
                        </ul>
                     </div>
                 ))}
              </div>
              <div className="p-4 bg-gray-50 border rounded-lg">
                 <h3 className="font-bold mb-2 text-green-700">API Endpoints</h3>
                 {config.api_endpoints?.map(api => (
                     <div key={api.path} className="mb-2">
                        <span className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono mr-2">{api.method}</span>
                        <span className="font-mono text-sm">{api.path}</span>
                        <p className="text-xs text-gray-500 mt-1">{api.description}</p>
                     </div>
                 ))}
              </div>
          </div>
      </div>
    </div>
  );
}
