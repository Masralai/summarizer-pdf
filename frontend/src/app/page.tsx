"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Settings2, 
  Zap, 
  Download, 
  Copy, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  FileSearch,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Types ---

interface SummaryStats {
  original_length: number;
  summary_length: number;
  original_word_count: number;
  summary_word_count: number;
  original_sentences: number;
  summary_sentences: number;
  compression_ratio: number;
}

interface SummaryResp {
  success: boolean;
  filename: string;
  summary: string;
  algorithm_used: string;
  statistics: SummaryStats;
  params: {
    algorithm: string;
    num_sentences: number;
  };
}

// --- Minimalist Particle Background ---

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F766E";
      
      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// --- Animation Helper ---
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down { animation: fadeInDown 0.6s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
  `}</style>
);

// --- Main Application ---

export default function Home() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<string>("frequency");
  const [numSentences, setNumSentences] = useState<number>(3);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [algorithmUsed, setAlgorithmUsed] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${apiBaseUrl}/health`, { timeout: 5000 });
        setIsBackendUp(true);
      } catch (err) {
        console.error("Backend unreachable:", err);
        setIsBackendUp(false);
      }
    };
    checkHealth();
  }, [apiBaseUrl]);

  // Handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }
    setFile(selectedFile);
    setSummary("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setError("");
    setSummary("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("algorithm", algorithm);
      formData.append("num_sentences", num_sentences.toString());

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await axios.post<SummaryResp>(
        `${apiBaseUrl}/summarize`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },

          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setSummaryStats(response.data.statistics);
        setAlgorithmUsed(response.data.algorithm_used);
      } else {
        setError("Failed to generate summary");
      }
    } catch (error: unknown) {
      console.error("Error processing PDF:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Server error occurred");
      } else if (error instanceof Error) {
        setError(error.message || "An unexpected error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file?.name.replace(".pdf", "") || "document"}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-[#0F766E]/30 selection:text-[#0F766E]">
      <AnimationStyles />
      <ParticleBackground />

      <main className="relative z-10 container mx-auto px-6 py-20 max-w-5xl">
        {/* Header Section */}
        <header className="mb-20 text-center animate-fade-in-down">
          <div className="flex justify-center mb-6">
            {isBackendUp === false && (
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full flex items-center text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                <AlertCircle className="w-3 h-3 mr-2" />
                System Offline • AI Services Unavailable
              </div>
            )}
            {isBackendUp === true && (
              <div className="bg-[#0F766E]/10 border border-[#0F766E]/20 px-4 py-1.5 rounded-full flex items-center text-[10px] font-bold text-[#0F766E] uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3 mr-2" />
                Systems Operational • AI Ready
              </div>
            )}
          </div>
          <h1 className="text-6xl sm:text-8xl font-bold mb-4 tracking-tighter text-white">
            SUMMARIZER<span className="text-[#0F766E]">.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Settings */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-center mb-8">
                <Settings2 className="w-4 h-4 text-[#0F766E] mr-3" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Configuration</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest">Algorithm</label>
                  <div className="space-y-2">
                    {[
                      { id: "frequency", name: "Frequency", icon: BarChart3 },
                      { id: "tfidf", name: "TF-IDF", icon: Cpu },
                      { id: "textrank", name: "TextRank", icon: FileSearch },
                      { id: "llm", name: "Neural", icon: Zap },
                    ].map((alg) => (
                      <button
                        key={alg.id}
                        onClick={() => setAlgorithm(alg.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200",
                          algorithm === alg.id 
                            ? "bg-[#0F766E]/10 border-[#0F766E]/50 text-white" 
                            : "bg-transparent border-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center">
                          <alg.icon className={cn("w-3.5 h-3.5 mr-3", algorithm === alg.id ? "text-[#0F766E]" : "text-muted-foreground")} />
                          <span className="text-xs font-bold tracking-tight">{alg.name}</span>
                        </div>
                        {algorithm === alg.id && <div className="w-1 h-1 rounded-full bg-[#0F766E]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precision</label>
                    <span className="text-[10px] font-mono text-[#0F766E] font-bold uppercase">{numSentences} Sentences</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={numSentences}
                    onChange={(e) => setNumSentences(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-10">
            {/* Upload Zone */}
            <div className={cn(
              "glass-card p-12 rounded-3xl border border-dashed transition-all duration-300 relative group",
              file ? "border-[#0F766E]/40 bg-[#0F766E]/5" : "border-white/10 hover:border-white/20"
            )}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                  file ? "bg-[#0F766E]/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <FileText className={cn("w-6 h-6", file ? "text-[#0F766E]" : "text-muted-foreground")} />
                </div>
                
                {file ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">{file.name}</p>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">Select PDF</p>
                    <p className="text-muted-foreground text-xs font-medium">Click or drag and drop to analyze</p>
                  </div>
                )}
              </div>

              {isLoading && uploadProgress > 0 && (
                <div className="mt-10 space-y-3">
                  <Progress value={uploadProgress} className="h-1 bg-white/5" />
                  <p className="text-[10px] font-bold text-center text-[#0F766E] uppercase tracking-widest">Analyzing {uploadProgress}%</p>
                </div>
              )}

              <div className="mt-10 flex justify-center">
                <Button 
                  onClick={handleSubmit}
                  disabled={!file || isLoading}
                  className="bg-[#0F766E] hover:bg-[#0F766E]/90 text-white px-12 h-12 rounded-xl font-bold tracking-tight transition-all duration-200 disabled:opacity-30"
                >
                  {isLoading ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Process Document"
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center text-red-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Result Area */}
            {summary && (
              <div className="animate-fade-in-up space-y-8">
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="bg-white/[0.02] px-8 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Summary Result</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={copyToClipboard} className="text-[10px] font-bold text-[#0F766E] hover:text-[#0F766E]/80 transition-colors uppercase tracking-widest flex items-center">
                        {isCopied ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                        {isCopied ? "Copied" : "Copy"}
                      </button>
                      <button onClick={downloadSummary} className="text-[10px] font-bold text-white/60 hover:text-white transition-colors uppercase tracking-widest flex items-center">
                        <Download className="w-3 h-3 mr-1.5" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-10">
                    <p className="text-white/80 leading-[1.8] text-lg font-medium tracking-tight">
                      {summary}
                    </p>
                    
                    {algorithmUsed && (
                      <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                        <span>Engine: {algorithmUsed}</span>
                        <span>Complexity: {numSentences} Sentences</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Grid */}
                {summaryStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Compress", value: `${summaryStats.compression_ratio}%` },
                      { label: "Reduction", value: `-${Math.round((1 - summaryStats.summary_word_count / summaryStats.original_word_count) * 100)}%` },
                      { label: "Words", value: summaryStats.summary_word_count },
                      { label: "Sents", value: summaryStats.summary_sentences },
                    ].map((stat, i) => (
                      <div key={i} className="glass-card p-5 rounded-2xl text-center">
                        <span className="block text-xl font-bold text-white mb-1 tracking-tighter">{stat.value}</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
