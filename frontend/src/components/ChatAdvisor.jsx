import { useState, useRef, useEffect } from "react";

export default function ChatAdvisor({ onExpenseAdded }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm FinWise. Tell me about your expenses or upload a payment screenshot and I'll track them automatically!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const tryExtractExpense = (text) => {
    const amountMatch = text.match(/₹[\s]*([\d,]+)/);
    if (!amountMatch) return;

    const amount = parseInt(amountMatch[1].replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) return;

    const lower = text.toLowerCase();
    let category = "Other";

    if (lower.includes("food") || lower.includes("zomato") ||
        lower.includes("swiggy") || lower.includes("restaurant"))
      category = "Food";
    else if (lower.includes("transport") || lower.includes("uber") ||
             lower.includes("ola") || lower.includes("petrol"))
      category = "Transport";
    else if (lower.includes("shopping") || lower.includes("amazon") ||
             lower.includes("flipkart") || lower.includes("myntra"))
      category = "Shopping";
    else if (lower.includes("utility") || lower.includes("electricity") ||
             lower.includes("bill") || lower.includes("recharge"))
      category = "Utilities";
    else if (lower.includes("entertainment") || lower.includes("netflix") ||
             lower.includes("movie") || lower.includes("spotify"))
      category = "Entertainment";
    else if (lower.includes("invest") || lower.includes("sip") ||
             lower.includes("mutual") || lower.includes("ppf"))
      category = "Investment";

    if (onExpenseAdded) {
      onExpenseAdded({
        amount,
        category,
        merchant: category,
        date: new Date().toLocaleDateString("en-IN")
      });
    }
  };

  const send = async () => {
    if (!input.trim() && !file) return;

    const userMsg = {
      role: "user",
      text: file
        ? `📎 ${file.name}: ${input || "Analyze this screenshot"}`
        : input
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const form = new FormData();

      if (file) {
        form.append("file", file);
        form.append("message", input || "Analyze this payment screenshot");

        const res = await fetch("http://127.0.0.1:8000/analyze-screenshot", {
          method: "POST",
          body: form,
        });
        const data = await res.json();

        tryExtractExpense(data.response);

        setMessages(prev => [...prev, {
          role: "assistant",
          text: data.response
        }]);

      } else {
        form.append("message", input);
        const res = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          body: form,
        });
        const data = await res.json();

        tryExtractExpense(data.response);

        setMessages(prev => [...prev, {
          role: "assistant",
          text: data.response
        }]);
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Could not connect to backend. Make sure it is running."
      }]);
    } finally {
      setLoading(false);
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i}
               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500
                              to-cyan-500 flex items-center justify-center
                              text-xs mr-3 flex-shrink-0 mt-1">
                🤖
              </div>
            )}

            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm
                            leading-relaxed whitespace-pre-wrap
                            ${msg.role === "user"
                              ? "bg-violet-600/80 text-white rounded-br-sm"
                              : "bg-white/5 text-white/90 border border-white/10 rounded-bl-sm"
                            }`}>
              {msg.text}
            </div>

          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500
                            to-cyan-500 flex items-center justify-center mr-3 flex-shrink-0">
              🤖
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3
                            rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i}
                       className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                       style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-white/5
                        border border-white/10 rounded-xl">
          <img src={preview} alt="preview"
               className="h-16 w-16 rounded-lg object-cover border border-white/20" />
          <div className="flex-1">
            <p className="text-xs text-white/70 font-medium">{file?.name}</p>
            <p className="text-xs text-white/40 mt-0.5">Ready to analyze</p>
          </div>
          <button onClick={removeFile}
                  className="w-6 h-6 bg-red-500/80 rounded-full text-white
                             text-xs flex items-center justify-center hover:bg-red-500">
            ✕
          </button>
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          "💰 Tax saving tips",
          "📈 SIP advice",
          "📊 Budget help",
          "🏦 Emergency fund"
        ].map(q => (
          <button key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border
                             border-white/10 text-white/50 hover:text-white/80
                             hover:bg-white/10 transition-all">
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex gap-3 items-end">

        <label className="cursor-pointer p-3 rounded-xl bg-white/5 border
                          border-white/10 hover:bg-white/10 transition-colors
                          text-lg flex-shrink-0">
          📎
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={file
            ? "Add a message about this screenshot..."
            : "Ask about SIP, tax, budget... or say 'I spent ₹500 on Zomato'"
          }
          rows={2}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3
                     text-sm text-white placeholder-white/30 resize-none
                     focus:outline-none focus:border-violet-500/50 transition-colors"
        />

        <button
          onClick={send}
          disabled={loading}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600
                     hover:from-violet-500 hover:to-cyan-500 transition-all
                     disabled:opacity-50 text-white text-lg flex-shrink-0">
          ➤
        </button>

      </div>
    </div>
  );
}
