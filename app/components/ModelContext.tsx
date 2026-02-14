"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type AIModel = "gpt-4o" | "claude" | "deepseek";

export const MODEL_INFO: Record<AIModel, { label: string; color: string }> = {
  "gpt-4o": { label: "GPT-4o", color: "#10a37f" },
  claude: { label: "Claude", color: "#d97706" },
  deepseek: { label: "DeepSeek", color: "#6366f1" },
};

interface ModelContextType {
  model: AIModel;
  setModel: (m: AIModel) => void;
}

const ModelContext = createContext<ModelContextType>({ model: "gpt-4o", setModel: () => {} });

export function ModelProvider({ children }: { children: ReactNode }) {
  const [model, setModelState] = useState<AIModel>("gpt-4o");

  useEffect(() => {
    const saved = localStorage.getItem("sydedu_ai_model") as AIModel | null;
    if (saved && saved in MODEL_INFO) setModelState(saved);
  }, []);

  const setModel = useCallback((m: AIModel) => {
    setModelState(m);
    localStorage.setItem("sydedu_ai_model", m);
  }, []);

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
