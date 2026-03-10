"use client";

import { useModelStore } from "../store/modelStore";

export default function Results() {
  const calculate = useModelStore((state) => state.calculate);
  const results = calculate();

  return (
    <div className="bg-gray-100 p-4 rounded">
      {Object.entries(results).map(([key, value]) => (
        <div key={key} className="flex justify-between mb-2">
          <span>{key}:</span>
          <span className="font-bold">{value}</span>
        </div>
      ))}
    </div>
  );
}
