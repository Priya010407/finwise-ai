import { useState } from "react";

export default function ExpenseUpload({ onExpenseAdded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("message", "Analyze this payment screenshot in detail");

      const res = await fetch(
        "https://finwise-ai-production-a273.up.railway.app/analyze-screenshot",
        { method: "POST", body: form }
      );
      const data = await res.json();
      setResult(data.response);

      // Try to extract expense for dashboard
      const amountMatch = data.response.match(/₹[\s]*([\d,]+)/);
      if (amountMatch && onExpenseAdded) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ""));
        const lower = data.response.toLowerCase();
        let category = "Other";
        if (lower.includes("food") || lower.includes("zomato") || lower.includes("swiggy"))
          category = "Food";
        else if (lower.includes("transport") || lower.includes("uber") || lower.includes("ola"))
          category = "Transport";
        else if (lower.includes("shopping") || lower.includes("amazon"))
          category = "Shopping";
        else if (lower.includes("entertainment") || lower.includes("netflix"))
          category = "Entertainment";
        else if (lower.includes("invest") || lower.includes("sip"))
          category = "Investment";

        onExpenseAdded({
          amount,
          category,
          merchant: category,
          date: new Date().toLocaleDateString("en-IN")
        });
      }
    } catch (err) {
      setResult("⚠️ Could not connect to backend. Make sure it is running.");
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Upload Payment Screenshot</h2>
        <p className="text-white/40 text-sm mt-1">
          Upload any UPI, PhonePe, GPay, or bank screenshot — AI will analyze it automatically
        </p>
      </div>

      {/* Upload Area */}
      {!preview ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64
                      border-2 border-dashed rounded-2xl cursor-pointer
                      transition-all duration-200
                      ${dragOver
                        ? "border-violet-400 bg-violet-500/10"
                        : "border-white/20 bg-white/3 hover:bg-white/5 hover:border-white/30"
                      }`}
        >
          <div className="text-5xl mb-4">📸</div>
          <p className="text-white/70 font-medium mb-1">
            Drop screenshot here or click to upload
          </p>
          <p className="text-white/30 text-xs">
            Supports: PNG, JPG, JPEG, WEBP
          </p>
          <div className="mt-4 px-5 py-2 rounded-xl bg-violet-600/80 
                          text-sm text-white font-medium">
            Choose File
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img
              src={preview}
              alt="Screenshot preview"
              className="w-full max-h-80 object-contain bg-black/30"
            />
            <button
              onClick={reset}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 
                         rounded-full text-white flex items-center 
                         justify-center hover:bg-red-500 text-sm"
            >
              ✕
            </button>
          </div>

          {/* File Info */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 
                          border border-white/10 rounded-xl">
            <span className="text-2xl">🖼️</span>
            <div>
              <p className="text-white/80 text-sm font-medium">{file.name}</p>
              <p className="text-white/40 text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 
                         to-cyan-600 hover:from-violet-500 hover:to-cyan-500 
                         transition-all text-white font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 
                                  border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "🔍 Analyze Screenshot"
              )}
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-sm font-semibold text-violet-400 mb-3">
              📊 Analysis Result
            </h3>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10
                         text-white/70 hover:bg-white/10 transition-all text-sm"
            >
              Upload Another
            </button>
            <button
              onClick={() => window.location.hash = "dashboard"}
              className="flex-1 py-2.5 rounded-xl bg-violet-600/80 
                         hover:bg-violet-600 transition-all text-white text-sm"
            >
              View Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Supported Apps */}
      <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
        <p className="text-xs text-white/30 mb-3">Supported payment apps:</p>
        <div className="flex gap-3 flex-wrap">
          {["PhonePe", "GPay", "Paytm", "BHIM", "Amazon Pay", "Bank SMS"].map(app => (
            <span key={app}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 
                             border border-white/10 text-white/50">
              {app}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}