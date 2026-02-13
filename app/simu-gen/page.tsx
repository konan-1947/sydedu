"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "../components/PageShell";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Circle,
  Play,
  ArrowLeft,
  Check,
} from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Mô phỏng vật rơi tự do từ độ cao 100m",
  "Mô phỏng con lắc đơn dao động với chiều dài 1m",
  "Mô phỏng chuyển động ném xiên với góc 45°",
  "Mô phỏng hai vật va chạm đàn hồi",
];

type AgentStep = "idle" | "analyzing" | "confirming" | "generating" | "reviewing" | "done";

const STEPS = [
  { key: "analyzing", label: "Phân tích yêu cầu" },
  { key: "confirming", label: "Xác nhận kế hoạch" },
  { key: "generating", label: "Sinh mô phỏng" },
  { key: "reviewing", label: "Kiểm tra & hoàn thiện" },
] as const;

function getStepIndex(step: AgentStep): number {
  if (step === "idle") return -1;
  if (step === "done") return 4;
  return STEPS.findIndex((s) => s.key === step);
}

export default function SimuGenPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [agentStep, setAgentStep] = useState<AgentStep>("idle");
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");

  // Agent state
  const [plan, setPlan] = useState("");
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [fixes, setFixes] = useState<string | null>(null);

  // Return-to-slide flow
  const [returnToSlide, setReturnToSlide] = useState(false);

  // On mount: check if coming from slide-builder
  useEffect(() => {
    const shouldReturn = sessionStorage.getItem("simugen_return");
    const prefill = sessionStorage.getItem("simugen_prefill");
    if (shouldReturn) {
      setReturnToSlide(true);
      sessionStorage.removeItem("simugen_return");
    }
    if (prefill) {
      setPrompt(prefill);
      sessionStorage.removeItem("simugen_prefill");
    }
  }, []);

  const reset = () => {
    setAgentStep("idle");
    setError("");
    setHtml("");
    setPlan("");
    setQuestions(null);
    setAnswers([]);
    setFixes(null);
  };

  const apiCall = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/simu-gen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi không xác định");
    return data;
  };

  const startAnalyze = async () => {
    if (!prompt.trim()) return;
    reset();
    setAgentStep("analyzing");
    try {
      const data = await apiCall({ step: "analyze", prompt: prompt.trim() });
      setPlan(data.plan);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(""));
      }
      setAgentStep("confirming");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
      setAgentStep("idle");
    }
  };

  const confirmAndGenerate = async () => {
    setAgentStep("generating");
    try {
      const answersText =
        questions && answers.some((a) => a.trim())
          ? questions.map((q, i) => `${q}: ${answers[i] || "(không trả lời)"}`).join("\n")
          : undefined;
      const genData = await apiCall({
        step: "generate",
        prompt: prompt.trim(),
        plan,
        answers: answersText,
      });

      setAgentStep("reviewing");
      const reviewData = await apiCall({
        step: "review",
        prompt: prompt.trim(),
        html: genData.html,
      });

      setHtml(reviewData.html);
      setFixes(reviewData.fixes);
      setAgentStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
      setAgentStep("idle");
    }
  };

  const handleInsertToSlide = () => {
    if (!html) return;
    sessionStorage.setItem("simugen_result_html", html);
    router.push("/slide-builder");
  };

  const currentIndex = getStepIndex(agentStep);
  const isProcessing = agentStep === "analyzing" || agentStep === "generating" || agentStep === "reviewing";
  const panelCompact = isProcessing || agentStep === "done";

  return (
    <PageShell>
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex gap-3 p-3">
            {/* Left Panel */}
            <div className={`shrink-0 flex flex-col gap-3 overflow-y-auto transition-all duration-300 ${panelCompact ? "w-[240px]" : "w-[300px]"}`}>
              {/* Back to slide button */}
              {returnToSlide && (
                <button
                  onClick={() => router.push("/slide-builder")}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-1"
                >
                  <ArrowLeft size={14} /> Quay về Slide Builder
                </button>
              )}

              {/* Prompt Input */}
              <div className="bg-white rounded-2xl border border-gray-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-orange-500" />
                  <h2 className="font-semibold text-sm text-gray-900">SimuGen AI</h2>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Mô tả mô phỏng vật lý bạn muốn tạo..."
                  rows={panelCompact ? 2 : 4}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && agentStep === "idle") startAnalyze();
                  }}
                />
                <button
                  onClick={startAnalyze}
                  disabled={isProcessing || !prompt.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {agentStep === "analyzing" ? (
                    <><Loader2 size={14} className="animate-spin" /> Đang phân tích...</>
                  ) : (
                    <><Send size={14} /> Tạo mô phỏng</>
                  )}
                </button>

                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

                {/* Example prompts */}
                {agentStep === "idle" && !html && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Gợi ý:</p>
                    <div className="space-y-1.5">
                      {EXAMPLE_PROMPTS.map((ep) => (
                        <button
                          key={ep}
                          onClick={() => setPrompt(ep)}
                          className="w-full text-left text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1.5 transition-colors"
                        >
                          {ep}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              {agentStep !== "idle" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-2">Tiến trình</p>
                  <div className="space-y-1.5">
                    {STEPS.map((s, i) => {
                      const isDone = currentIndex > i;
                      const isActive = currentIndex === i;
                      return (
                        <div key={s.key} className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          ) : isActive ? (
                            <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
                          ) : (
                            <Circle size={14} className="text-gray-300 shrink-0" />
                          )}
                          <span className={`text-xs ${isActive ? "text-blue-600 font-medium" : isDone ? "text-gray-700" : "text-gray-400"}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {fixes && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700"><span className="font-medium">Đã sửa:</span> {fixes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Plan & Questions - Confirming step */}
              {agentStep === "confirming" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Kế hoạch</p>
                  <textarea
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {questions && questions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Câu hỏi từ AI</p>
                      <div className="space-y-2">
                        {questions.map((q, i) => (
                          <div key={i}>
                            <p className="text-xs text-gray-600 mb-1">{q}</p>
                            <input
                              type="text"
                              value={answers[i] || ""}
                              onChange={(e) => {
                                const next = [...answers];
                                next[i] = e.target.value;
                                setAnswers(next);
                              }}
                              placeholder="Trả lời..."
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={confirmAndGenerate}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Play size={14} /> Xác nhận & Tạo mô phỏng
                  </button>
                </div>
              )}

              {/* Insert to slide button - shown when done and came from slide-builder */}
              {agentStep === "done" && returnToSlide && (
                <button
                  onClick={handleInsertToSlide}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-shadow"
                >
                  <Check size={16} /> Chèn vào Slide
                </button>
              )}
            </div>

            {/* Right Panel - Simulation */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {html ? (
                <iframe
                  srcDoc={html}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                  title="Mô phỏng vật lý"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  {isProcessing
                    ? "Đang xử lý..."
                    : "Nhập mô tả và nhấn \"Tạo mô phỏng\" để bắt đầu"}
                </div>
              )}
            </div>
          </div>
        </main>
    </PageShell>
  );
}
