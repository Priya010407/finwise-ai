export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "chat", icon: "🤖", label: "AI Advisor" },
    { id: "upload", icon: "📸", label: "Upload" },
  ];

  return (
    <div className="w-20 lg:w-56 h-screen bg-[#0d0d1f] border-r border-white/5 
                    flex flex-col py-6 px-3 flex-shrink-0">
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="text-2xl">💰</div>
        <div className="hidden lg:block text-sm font-bold bg-gradient-to-r 
                        from-violet-400 to-cyan-400 bg-clip-text text-transparent mt-1">
          FinWise AI
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm 
                        transition-all text-left
                        ${activeTab === tab.id
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
                        }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="hidden lg:block font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}