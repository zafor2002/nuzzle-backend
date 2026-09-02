import Link from "next/link";

export default function Home() {
  const endpoints = [
    { method: "GET/POST", path: "/api/posts", desc: "Den Feed moments, 5 tactile reactions & comments" },
    { method: "GET/POST", path: "/api/pets", desc: "Pet Passports, microchip data & digital passports" },
    { method: "GET/POST", path: "/api/auth/login", desc: "Supabase authentication & session tokens" },
    { method: "GET/POST", path: "/api/vet/directory", desc: "Telemedicine clinics & appointment scheduling" },
    { method: "GET/POST", path: "/api/lost-found", desc: "5-Mile emergency radar & claim-and-lock rescue" },
    { method: "GET/POST", path: "/api/marketplace", desc: "Verified pet boutique catalog & listings" },
    { method: "POST", path: "/api/pawai/triage", desc: "24/7 symptom triage engine (Bangla & English)" },
  ];

  return (
    <main className="min-h-screen bg-[#0E0F17] text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full bg-[#161726]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              🐾
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Nuzzle <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">API v2.0</span>
              </h1>
              <p className="text-xs text-gray-400">Next-Gen Pet Ecosystem REST Engine & Supabase Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-gray-400 block font-medium">Database</span>
            <span className="text-sm font-bold text-white mt-1 block">PostgreSQL</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-gray-400 block font-medium">Auth Provider</span>
            <span className="text-sm font-bold text-purple-300 mt-1 block">Supabase JWT</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-xs text-gray-400 block font-medium">Radar Radius</span>
            <span className="text-sm font-bold text-rose-400 mt-1 block">5.0 Miles</span>
          </div>
        </div>

        {/* REST API Endpoints Directory */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Live REST Handlers</span>
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <div key={ep.path} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-semibold text-gray-200">{ep.path}</span>
                </div>
                <span className="text-[11px] text-gray-400 hidden sm:inline">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Frontend Launch Link */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-gray-400">
            Deployed via Vercel • Connected to Supabase
          </span>
          <a
            href="https://github.com/zafor2002/nuzzle-"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            Frontend Repository ↗
          </a>
        </div>
      </div>
    </main>
  );
}
