"use client";

import { useModelStore } from "../store/modelStore";

export default function FormulaEditor() {
  const formulas = useModelStore((state) => state.formulas);
  const setFormula = useModelStore((state) => state.setFormula);

  return (
    <div className="space-y-4">
      {Object.entries(formulas).map(([key, formula]) => (
        <div key={key}>
          <label className="font-medium">{key}</label>
          <input
            className="border w-full px-2 py-1 rounded mt-1"
            value={formula}
            onChange={(e) => setFormula(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
