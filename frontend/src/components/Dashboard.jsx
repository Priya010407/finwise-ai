import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = {
  "Food": "#f59e0b",
  "Transport": "#06b6d4",
  "Shopping": "#8b5cf6",
  "Utilities": "#10b981",
  "Entertainment": "#f43f5e",
  "Investment": "#6366f1",
  "Other": "#94a3b8"
};

const EMOJIS = {
  "Food": "🍔",
  "Transport": "🚗",
  "Shopping": "🛍️",
  "Utilities": "💡",
  "Entertainment": "🎬",
  "Investment": "📈",
  "Other": "💳"
};

export default function Dashboard({ expenses }) {
  // If no expenses, show empty state
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="text-6xl">📊</div>
        <h2 className="text-xl font-bold text-white/80">No Expenses Yet</h2>
        <p className="text-white/40 text-sm text-center max-w-sm">
          Go to AI Advisor and upload a payment screenshot or tell the AI
          about your expenses to see them here!
        </p>
        <div className="flex gap-3 text-xs text-white/30 mt-2">
          <span>💡 Try: "I spent ₹500 on Zomato today"</span>
        </div>
      </div>
    );
  }

  // Group expenses by category
  const categoryMap = {};
  expenses.forEach(exp => {
    const cat = exp.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
  });

  const spendingData = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    emoji: EMOJIS[category] || "💳",
    color: COLORS[category] || "#94a3b8"
  }));

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = Math.round(total * 0.2);
  const healthScore = total < 20000 ? 85 : total < 35000 ? 70 : 55;

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">
            ₹{total.toLocaleString()}
          </p>
          <p className="text-xs mt-1 text-red-400">
            {expenses.length} transactions
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">Suggested Savings</p>
          <p className="text-2xl font-bold text-white">
            ₹{totalSaved.toLocaleString()}
          </p>
          <p className="text-xs mt-1 text-emerald-400">20% of income rule</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs mb-1">Health Score</p>
          <p className="text-2xl font-bold text-white">{healthScore} / 100</p>
          <p className={`text-xs mt-1 ${healthScore > 75 ? "text-emerald-400" : "text-amber-400"}`}>
            {healthScore > 75 ? "Excellent" : healthScore > 60 ? "Good" : "Needs Attention"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={spendingData} dataKey="amount" nameKey="category"
                   cx="50%" cy="50%" outerRadius={80} stroke="none">
                {spendingData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `₹${v.toLocaleString()}`}
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #ffffff20",
                  borderRadius: "12px",
                  color: "#fff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {spendingData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                     style={{ background: item.color }} />
                {item.emoji} {item.category}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-52">
            {expenses.slice().reverse().map((exp, i) => (
              <div key={i} className="flex items-center justify-between
                                      text-xs border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span>{EMOJIS[exp.category] || "💳"}</span>
                  <div>
                    <p className="text-white/80 font-medium">{exp.merchant || exp.category}</p>
                    <p className="text-white/30">{exp.date || "Today"}</p>
                  </div>
                </div>
                <span className="text-red-400 font-medium">
                  -₹{exp.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4">
          Category Breakdown
        </h3>
        <div className="space-y-3">
          {spendingData.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl w-8">{item.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{item.category}</span>
                  <span className="text-white font-medium">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{
                         width: `${(item.amount / total) * 100}%`,
                         background: item.color
                       }} />
                </div>
              </div>
              <span className="text-xs text-white/30 w-10 text-right">
                {Math.round((item.amount / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}