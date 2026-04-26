"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ErrorBoundary } from "@/components/error-boundary";
import type {
  SummaryStats,
  SummaryResponse,
  ErrorResponse,
  Algorithm,
} from "@/types/api";

const ALGORITHMS = [
  {
    id: "frequency" as Algorithm,
    label: "Frequency",
    sub: "Fast, word frequency ranking",
  },
  {
    id: "tfidf" as Algorithm,
    label: "TF-IDF",
    sub: "Statistical importance scoring",
  },
  {
    id: "textrank" as Algorithm,
    label: "TextRank",
    sub: "Graph-based sentence similarity",
  },
  {
    id: "llm" as Algorithm,
    label: "Neural",
    sub: "AI generation",
  },
];

const AmbientBackground = () => {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let t = 0;

    const animate = () => {
      t += 0.0003;
      if (blobRef.current) {
        const x = 50 + Math.sin(t) * 20;
        const y = 50 + Math.cos(t * 0.7) * 15;
        blobRef.current.style.background = `radial-gradient(ellipse 60% 50% at ${x}% ${y}%, rgba(212,165,116,0.025) 0%, transparent 70%)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      ref={blobRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,165,116,0.025) 0%, transparent 70%)",
      }}
    />
  );
};

const StatusBadge = ({
  status,
}: {
  status: "online" | "offline" | "loading";
}) => {
  const map = {
    online: { label: "System Online", className: "text-[#D4A574]" },
    offline: { label: "System Offline", className: "text-[#DC2626]" },
    loading: { label: "Checking Status", className: "text-[#737373]" },
  };
  const s = map[status];
  return (
    <span
      className={`text-[10px] font-mono uppercase tracking-[0.12em] ${s.className}`}
    >
      {s.label}
    </span>
  );
};

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="surface-raised p-5 rounded-[8px]">
    <div className="text-2xl font-medium text-[#E5E5E5] tracking-tightest font-serif leading-snug mb-1">
      {value}
    </div>
    <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
      {label}
    </div>
  </div>
);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("llm");
  const [numSentences, setNumSentences] = useState<number>(3);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [algorithmUsed, setAlgorithmUsed] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isBackendUp, setIsBackendUp] = useState<"online" | "offline" | "loading">(
    "loading"
  );

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${apiBaseUrl}/health`, { timeout: 5000 });
        setIsBackendUp("online");
      } catch {
        setIsBackendUp("offline");
      }
    };
    checkHealth();
  }, [apiBaseUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      setFile(null);
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setSummary("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setError("");
    setSummary("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("algorithm", algorithm);
      formData.append("num_sentences", numSentences.toString());

      const response = await axios.post<SummaryResponse>(
        `${apiBaseUrl}/summarize`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const pct = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(pct);
          },
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setSummaryStats(response.data.statistics);
        setAlgorithmUsed(response.data.algorithm_used);
      } else {
        setError("Failed to generate summary.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ErrorResponse | undefined;
        setError(data?.error || "Server error occurred.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
  };

  const downloadSummary = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([summary], { type: "text/plain" })
    );
    a.download = `${file?.name.replace(".pdf", "") || "document"}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fileSizeLabel = file
    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
    : null;

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] editorial-grid">
      <AmbientBackground />

      <main className="relative z-10 max-w-5xl mx-auto px-8 py-24 lg:py-32">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center justify-between mb-10 fade-in-up">
            <StatusBadge status={isBackendUp} />
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
              PDF Analysis
            </span>
          </div>

          <h1
            className="font-serif text-6xl lg:text-8xl font-medium tracking-tightest leading-snug text-[#E5E5E5] fade-in-up fade-in-up-delay-1"
            style={{ letterSpacing: "-0.04em" }}
          >
            Summarizer.
          </h1>
          <p className="mt-5 text-sm text-[#737373] leading-relaxed max-w-md fade-in-up fade-in-up-delay-2">
            Upload a PDF and choose an algorithm to generate a concise,
            structured summary in seconds.
          </p>
        </header>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar — Configuration */}
          <aside className="lg:col-span-4 space-y-4 stagger-children">
            <div className="surface-elevated p-7 rounded-[8px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373] mb-6">
                Configuration
              </p>

              <div className="space-y-2">
                {ALGORITHMS.map((alg) => (
                  <button
                    key={alg.id}
                    onClick={() => setAlgorithm(alg.id)}
                    className={`w-full text-left p-4 rounded-[6px] border transition-all duration-200 ${
                      algorithm === alg.id
                        ? "bg-[#111111] border-[#262626] border-[#D4A574]/40"
                        : "bg-transparent border-[#1A1A1A] hover:border-[#262626]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#E5E5E5]">
                      {alg.label}
                    </div>
                    <div className="text-[11px] text-[#737373] mt-0.5">
                      {alg.sub}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#1A1A1A]">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
                    Precision
                  </p>
                  <span className="text-[11px] font-mono text-[#D4A574]">
                    {numSentences}
                  </span>
                </div>

                <div
                  ref={sliderRef}
                  className="relative h-5 flex items-center select-none cursor-pointer"
                  onMouseDown={() => setIsDragging(true)}
                  onMouseMove={(e) => {
                    if (!isDragging && !e.buttons) return;
                    const rect = sliderRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setNumSentences(Math.round(2 + pct * 8));
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onClick={(e) => {
                    const rect = sliderRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const pct = (e.clientX - rect.left) / rect.width;
                    setNumSentences(Math.round(2 + pct * 8));
                  }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-[2px] bg-[#1A1A1A] rounded-full" />
                  </div>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#D4A574] rounded-full pointer-events-none"
                    style={{
                      width: `${((numSentences - 2) / 8) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#D4A574] border border-[#0A0A0A] transition-all duration-100 hover:scale-125 cursor-pointer"
                    style={{
                      left: `calc(${((numSentences - 2) / 8) * 100}% - 6px)`,
                    }}
                  />
                  <div className="relative w-full flex justify-between px-[6px]">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div
                        key={n}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNumSentences(n);
                        }}
                        className={`w-1 h-1 rounded-full transition-colors duration-150 ${
                          numSentences >= n
                            ? "bg-[#D4A574]"
                            : "bg-[#333333]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <span className="text-[9px] font-mono text-[#4A4A4A]">2</span>
                  <span className="text-[9px] font-mono text-[#4A4A4A]">10</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main — Upload + Results */}
          <div className="lg:col-span-8 space-y-4">
            {/* Upload Zone */}
            <ErrorBoundary>
              <div
                className={`surface-elevated p-10 rounded-[8px] border transition-all duration-300 ${
                  file
                    ? "border-[#262626]"
                    : "border-dashed border-[#262626] hover:border-[#333333]"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  style={{ position: "absolute", width: "1px", height: "1px" }}
                />

                {file ? (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#E5E5E5] mb-1">
                        {file.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#737373]">
                        {fileSizeLabel}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#D4A574]">
                      Ready
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-[#737373]">
                      Drop a PDF or click to select
                    </div>
                    <div className="text-[11px] text-[#4A4A4A] mt-1 font-mono">
                      PDF files up to 10MB
                    </div>
                  </div>
                )}

                {isLoading && uploadProgress > 0 && (
                  <div className="mt-6">
                    <Progress value={uploadProgress} />
                    <div className="text-[10px] font-mono text-center text-[#737373] mt-2 uppercase tracking-[0.1em]">
                      Processing {uploadProgress}%
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={!file || isLoading}
                    size="lg"
                    className="bg-[#E5E5E5] text-[#0A0A0A] hover:bg-[#D5D5D5] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="font-mono text-xs">Processing</span>
                    ) : (
                      <span className="text-sm">Generate Summary</span>
                    )}
                  </Button>
                </div>
              </div>
            </ErrorBoundary>

            {/* Error */}
            {error && (
              <div className="surface-elevated p-4 rounded-[6px] border border-[#262626]">
                <p className="text-xs text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Result */}
            {summary && (
              <ErrorBoundary>
                <div className="surface-raised rounded-[8px] overflow-hidden fade-in-up">
                  <div className="flex items-center justify-between px-7 py-5 border-b border-[#1A1A1A]">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
                      Summary
                    </span>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={copyToClipboard}
                        className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#737373] hover:text-[#D4A574] transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={downloadSummary}
                        className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#737373] hover:text-[#E5E5E5] transition-colors"
                      >
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="px-7 py-8">
                    <p className="text-[15px] leading-[1.8] text-[#C8C8C8]">
                      {summary}
                    </p>

                    <div className="mt-10 pt-6 border-t border-[#1A1A1A] flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
                        Engine:{" "}
                        <span className="text-[#E5E5E5]">{algorithmUsed}</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#737373]">
                        Sentences:{" "}
                        <span className="text-[#E5E5E5]">{numSentences}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {summaryStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
                    <StatCard
                      label="Compression"
                      value={`${summaryStats.compression_ratio}%`}
                    />
                    <StatCard
                      label="Reduction"
                      value={`-${Math.round(
                        (1 -
                          summaryStats.summary_word_count /
                            summaryStats.original_word_count) *
                          100
                      )}%`}
                    />
                    <StatCard
                      label="Words"
                      value={summaryStats.summary_word_count}
                    />
                    <StatCard
                      label="Sentences"
                      value={summaryStats.summary_sentences}
                    />
                  </div>
                )}
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#4A4A4A] uppercase tracking-[0.1em]">
            Summarizer PDF Analysis
          </span>
          <span className="text-[10px] font-mono text-[#4A4A4A] uppercase tracking-[0.1em]">
            Algorithms: Frequency / TF-IDF / TextRank / Neural
          </span>
        </footer>
      </main>
    </div>
  );
}