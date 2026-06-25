import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatAdvisor from "./components/ChatAdvisor";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen bg-[#0a0a14] text-white overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#0d0d1f]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400
                             to-cyan-400 bg-clip-text text-transparent">
                {activeTab === "dashboard" && "Spending Dashboard"}
                {activeTab === "chat" && "AI Financial Advisor"}
                {activeTab === "upload" && "Upload Screenshot"}
              </h1>
              <p className="text-xs text-white/30 mt-0.5">
                {activeTab === "dashboard" && "Your spending overview for April 2026"}
                {activeTab === "chat" && "Ask anything about your finances"}
                {activeTab === "upload" && "Extract expenses from payment screenshots"}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 text-xs text-white/40
                            bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400
                               animate-pulse inline-block"></span>
              AI Online
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "chat" && <ChatAdvisor />}
          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-6xl">📸</div>
              <h2 className="text-xl font-bold text-white/80">Upload Payment Screenshot</h2>
              <p className="text-white/40 text-sm text-center max-w-sm">
                Upload any UPI, PhonePe, GPay, or bank screenshot and our AI will 
                automatically extract and categorize the expense.
              </p>
              <label className="cursor-pointer px-6 py-3 rounded-xl bg-violet-600
                                hover:bg-violet-500 transition-all text-sm font-medium">
                📎 Choose Screenshot
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}