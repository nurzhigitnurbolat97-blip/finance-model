"use client";

import { useModelStore } from "../store/modelStore";

export default function Inputs() {
  const variables = useModelStore((state) => state.variables);
  const setVariable = useModelStore((state) => state.setVariable);

  return (
    <div className="space-y-4">
      {Object.entries(variables).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <label className="w-32 font-medium">{key}</label>
          <input
            className="border px-2 py-1 rounded"
            type="number"
            value={value}
            onChange={(e) => setVariable(key, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
