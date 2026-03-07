'use client'

import { useState } from 'react'

export default function Page() {
  const [revenue, setRevenue] = useState(0)
  const [costs, setCosts] = useState(0)

  const profit = revenue - costs

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Финансовый калькулятор</h1>

      <div style={{ marginTop: 20 }}>
        <label>Выручка</label>
        <input
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Расходы</label>
        <input
          type="number"
          value={costs}
          onChange={(e) => setCosts(Number(e.target.value))}
        />
      </div>

      <h2 style={{ marginTop: 20 }}>
        Прибыль: {profit}
      </h2>
    </div>
  )
}
