import { create } from "zustand";
import { evaluate } from "mathjs";

interface ModelState {
  variables: Record<string, number>;
  formulas: Record<string, string>;
  setVariable: (key: string, value: number) => void;
  setFormula: (key: string, value: string) => void;
  calculate: () => Record<string, number>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  variables: {
    price: 10,
    volume: 1000,
    growth: 0.05,
  },
  formulas: {
    revenue: "price * volume",
  },
  setVariable: (key, value) =>
    set((state) => ({
      variables: { ...state.variables, [key]: value },
    })),
  setFormula: (key, value) =>
    set((state) => ({
      formulas: { ...state.formulas, [key]: value },
    })),
  calculate: () => {
    const vars = get().variables;
    const forms = get().formulas;
    const results: Record<string, number> = {};

    for (const key in forms) {
      results[key] = evaluate(forms[key], vars);
    }

    return results;
  },
}));