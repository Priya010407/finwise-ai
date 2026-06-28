import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatAdvisor from "./components/ChatAdvisor";
import ExpenseUpload from "./components/ExpenseUpload";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("finwise_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const addExpense = (expense) => {
    const updated = [...expenses, expense];
    setExpenses(updated);
    localStorage.setItem("finwise_expenses", JSON.stringify(updated));
  };

  const clearExpenses = () => {
    setExpenses([]);
    localStorage.removeItem("finwise_expenses");
  };

  return (
    <div className="flex h-screen bg-[#0a0a14] text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
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
                {activeTab === "dashboard" && `${expenses.length} transactions tracked`}
                {activeTab === "chat" && "Ask anything about your finances"}
                {activeTab === "upload" && "Extract expenses from payment screenshots"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {expenses.length > 0 && activeTab === "dashboard" && (
                <button
                  onClick={clearExpenses}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20
                             border border-red-500/30 text-red-400
                             hover:bg-red-500/30 transition-all">
                  Clear All
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-white/40
                              bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400
                                 animate-pulse inline-block"></span>
                AI Online
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <Dashboard expenses={expenses} />
          )}
          {activeTab === "chat" && (
            <ChatAdvisor onExpenseAdded={addExpense} />
          )}
          {activeTab === "upload" && (
            <ExpenseUpload onExpenseAdded={addExpense} />
          )}
        </div>
      </div>
    </div>
  );
}