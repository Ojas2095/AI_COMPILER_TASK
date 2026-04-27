"use client";

import React, { useState } from "react";
import RuntimeRenderer from "./RuntimeRenderer";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setLogs([]);
    setConfig(null);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unknown error");
      setLogs(data.logs);
      setConfig(data.config);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen text-black bg-white">
      {/* Left panel: Logs and input */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-black mb-2 flex items-center gap-2">🤖 AI Compiler</h1>
          <p className="text-sm text-gray-500 mb-4">Enter a natural language description to compile into a validated system layout.</p>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-blue-500 text-black shadow-inner"
            placeholder="e.g., Build a CRM with login, contacts, dashboard, role-based access..."
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-bold shadow-md transition-all"
          >
            {loading ? "Compiling Execution Graph..." : "Run Compiler Pipeline"}
          </button>
          
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">{error}</div>}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <h2 className="font-bold text-gray-700">Pipeline Logs & Schema Validations</h2>
          {logs.map((stage: any, i: number) => (
             <div key={i} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded font-bold uppercase">{stage.stage} Layer</span>
                </div>
                <div className="pl-4 border-l-2 border-gray-300 flex flex-col gap-2">
                   {stage.logs?.map((lLog: any, k: number) => (
                     <div key={k} className={`p-3 rounded text-xs font-mono shadow-sm border ${lLog.status === 'success' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                        <div className="font-bold mb-1">Attempt {lLog.attempt}: {lLog.status.toUpperCase()}</div>
                        {lLog.status === 'success' ? (
                           <div className="h-24 overflow-y-auto bg-white p-2 border border-green-100 text-gray-600 break-all">
                              {lLog.raw}
                           </div>
                        ) : (
                           <div className="text-red-700">{lLog.error}</div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          ))}
          {loading && <div className="text-sm text-gray-500 animate-pulse flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 animate-bounce"></div> Building layout graph...
          </div>}
        </div>
      </div>

      {/* Right panel: Runtime Simulator */}
      <div className="w-full md:w-1/2 bg-gray-200 h-screen overflow-y-auto hidden md:block">
         {config ? <RuntimeRenderer config={config} /> : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-[#eef1f5]">
               <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
               <div>Awaiting Compilation Request</div>
               <div className="text-xs mt-2 w-64 text-center">Output schemas will be executed down here as live structural previews.</div>
            </div>
         )}
      </div>
    </main>
  );
}
