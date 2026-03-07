"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type ScenarioKey = "base" | "optimistic" | "crisis";
type TaxMode = "simplified" | "ip_general" | "too_general";

type Product = {
  id: number;
  name: string;
  price: number;
  volume: number;
  growth: number; // хранится как 3, 5, 10
  costPerUnit: number;
};

const scenarioConfig: Record<
  ScenarioKey,
  {
    title: string;
    volumeMultiplier: number;
    priceMultiplier: number;
    marketingMultiplier: number;
  }
> = {
  base: {
    title: "Базовый",
    volumeMultiplier: 1,
    priceMultiplier: 1,
    marketingMultiplier: 1,
  },
  optimistic: {
    title: "Оптимистичный",
    volumeMultiplier: 1.2,
    priceMultiplier: 1.05,
    marketingMultiplier: 1.1,
  },
  crisis: {
    title: "Кризисный",
    volumeMultiplier: 0.8,
    priceMultiplier: 0.95,
    marketingMultiplier: 0.85,
  },
};

const taxModeConfig: Record<
  TaxMode,
  {
    title: string;
    description: string;
  }
> = {
  simplified: {
    title: "Упрощённый режим",
    description: "3% от оборота",
  },
  ip_general: {
    title: "ОУР ИП",
    description: "10% от EBITDA",
  },
  too_general: {
    title: "ОУР ТОО",
    description: "20% от EBITDA",
  },
};

function formatNumber(value: number) {
  return value.toLocaleString("ru-RU");
}

function parseNumberInput(value: string) {
  if (value.trim() === "") return 0;
  return Number(value);
}

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  suffix?: string;
};

function NumberInput({
  label,
  value,
  onChange,
  step,
  suffix,
}: NumberInputProps) {
  return (
    <div>
      <label className="block text-sm mb-1 text-slate-600">{label}</label>
      <div className="relative">
        <input
          className={`border border-slate-300 bg-white px-3 py-2 rounded-xl w-full ${
            suffix ? "pr-10" : ""
          }`}
          type="number"
          step={step}
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(parseNumberInput(e.target.value))}
          onBlur={(e) => {
            if (e.target.value.trim() === "") onChange(0);
          }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [taxMode, setTaxMode] = useState<TaxMode>("simplified");
  const [months, setMonths] = useState(12);
  const [startingCash, setStartingCash] = useState(50000);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Продукт 1",
      price: 10,
      volume: 1000,
      growth: 5,
      costPerUnit: 4,
    },
    {
      id: 2,
      name: "Продукт 2",
      price: 25,
      volume: 300,
      growth: 3,
      costPerUnit: 11,
    },
  ]);

  const [marketing, setMarketing] = useState(15000);
  const [salaryCosts, setSalaryCosts] = useState(40000);
  const [rentCosts, setRentCosts] = useState(12000);
  const [otherOpex, setOtherOpex] = useState(8000);

  // Новые переменные расходы (% от выручки)
  const [bankCommissionRate, setBankCommissionRate] = useState(1);
  const [teamKpiRate, setTeamKpiRate] = useState(5);
  const [drrRate, setDrrRate] = useState(10);

  const selectedScenario = scenarioConfig[scenario];

  const updateProduct = (
    id: number,
    field: keyof Product,
    value: string | number
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Продукт ${prev.length + 1}`,
        price: 10,
        volume: 100,
        growth: 2,
        costPerUnit: 4,
      },
    ]);
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const forecast = useMemo(() => {
    const rows = [];
    let cumulativeCash = startingCash;

    for (let month = 1; month <= months; month++) {
      let totalRevenue = 0;
      let totalCogs = 0;
      let totalUnits = 0;

      for (const product of products) {
        const scenarioVolume = product.volume * selectedScenario.volumeMultiplier;
        const scenarioPrice = product.price * selectedScenario.priceMultiplier;

        const currentVolume =
          scenarioVolume * Math.pow(1 + product.growth / 100, month - 1);

        const revenue = scenarioPrice * currentVolume;
        const cogs = product.costPerUnit * currentVolume;

        totalUnits += currentVolume;
        totalRevenue += revenue;
        totalCogs += cogs;
      }

      // Переменные расходы от выручки
      const bankCommission = totalRevenue * (bankCommissionRate / 100);
      const teamKpi = totalRevenue * (teamKpiRate / 100);
      const drr = totalRevenue * (drrRate / 100);

      const totalVariableExpenses =
        totalCogs + bankCommission + teamKpi + drr;

      const grossProfit = totalRevenue - totalVariableExpenses;

      const monthlyMarketing = marketing * selectedScenario.marketingMultiplier;
      const monthlySalaries = salaryCosts;
      const monthlyRent = rentCosts;
      const monthlyOther = otherOpex;

      const totalOpex =
        monthlyMarketing + monthlySalaries + monthlyRent + monthlyOther;

      const ebitda = grossProfit - totalOpex;

      let tax = 0;
      if (taxMode === "simplified") {
        tax = totalRevenue * 0.03;
      } else if (taxMode === "ip_general") {
        tax = ebitda > 0 ? ebitda * 0.1 : 0;
      } else if (taxMode === "too_general") {
        tax = ebitda > 0 ? ebitda * 0.2 : 0;
      }

      const netProfit = ebitda - tax;
      const cashFlow = netProfit;
      cumulativeCash += cashFlow;

      const grossMargin =
        totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const effectiveTaxRate =
        totalRevenue > 0 ? (tax / totalRevenue) * 100 : 0;

      rows.push({
        month: `М${month}`,
        units: Math.round(totalUnits),
        revenue: Math.round(totalRevenue),

        cogs: Math.round(totalCogs),
        bankCommission: Math.round(bankCommission),
        teamKpi: Math.round(teamKpi),
        drr: Math.round(drr),
        totalVariableExpenses: Math.round(totalVariableExpenses),

        grossProfit: Math.round(grossProfit),

        marketing: Math.round(monthlyMarketing),
        salaries: Math.round(monthlySalaries),
        rent: Math.round(monthlyRent),
        otherOpex: Math.round(monthlyOther),
        totalOpex: Math.round(totalOpex),

        ebitda: Math.round(ebitda),
        tax: Math.round(tax),
        netProfit: Math.round(netProfit),
        cashFlow: Math.round(cashFlow),
        endingCash: Math.round(cumulativeCash),

        grossMargin: Math.round(grossMargin * 100) / 100,
        netMargin: Math.round(netMargin * 100) / 100,
        effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      });
    }

    return rows;
  }, [
    products,
    months,
    startingCash,
    marketing,
    salaryCosts,
    rentCosts,
    otherOpex,
    selectedScenario,
    taxMode,
    bankCommissionRate,
    teamKpiRate,
    drrRate,
  ]);

  const totalRevenue = forecast.reduce((sum, row) => sum + row.revenue, 0);
  const totalCogs = forecast.reduce((sum, row) => sum + row.cogs, 0);
  const totalBankCommission = forecast.reduce(
    (sum, row) => sum + row.bankCommission,
    0
  );
  const totalTeamKpi = forecast.reduce((sum, row) => sum + row.teamKpi, 0);
  const totalDrr = forecast.reduce((sum, row) => sum + row.drr, 0);
  const totalGrossProfit = forecast.reduce((sum, row) => sum + row.grossProfit, 0);
  const totalEbitda = forecast.reduce((sum, row) => sum + row.ebitda, 0);
  const totalTax = forecast.reduce((sum, row) => sum + row.tax, 0);
  const totalNetProfit = forecast.reduce((sum, row) => sum + row.netProfit, 0);
  const endingCash = forecast[forecast.length - 1]?.endingCash ?? startingCash;

  const profitableMonths = forecast.filter((row) => row.netProfit > 0).length;
  const lossMonths = forecast.filter((row) => row.netProfit < 0).length;

  return (
    <div className="min-h-screen bg-[#edf7ef] text-slate-900">
      <div className="flex">
        <aside className="hidden lg:flex w-72 min-h-screen border-r border-green-100 bg-white/80 backdrop-blur-sm p-6 flex-col gap-6 sticky top-0">
          <div>
            <p className="text-sm font-semibold text-green-700">AI CFO</p>
            <h1 className="text-2xl font-bold mt-1">Финансовый симулятор</h1>
            <p className="text-sm text-slate-500 mt-2">
              Управляй прогнозом выручки, расходами, EBITDA и денежным потоком.
            </p>
          </div>

          <nav className="space-y-2">
            <div className="rounded-xl bg-green-100 text-green-900 px-4 py-3 font-medium">
              Обзор модели
            </div>
            <div className="rounded-xl px-4 py-3 text-slate-600">Продукты</div>
            <div className="rounded-xl px-4 py-3 text-slate-600">Переменные расходы</div>
            <div className="rounded-xl px-4 py-3 text-slate-600">OPEX</div>
            <div className="rounded-xl px-4 py-3 text-slate-600">Графики</div>
            <div className="rounded-xl px-4 py-3 text-slate-600">Таблица прогноза</div>
          </nav>

          <div className="mt-auto rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="text-sm text-slate-500">Активный сценарий</div>
            <div className="mt-2 text-lg font-bold text-green-800">
              {selectedScenario.title}
            </div>
            <div className="mt-3 text-sm text-slate-500">Налоговый режим</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">
              {taxModeConfig[taxMode].title}
            </div>
            <div className="text-xs text-slate-500">
              {taxModeConfig[taxMode].description}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            <header className="bg-white rounded-3xl border border-green-100 shadow-sm px-6 py-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Модель / Планирование / 2026
                </p>
                <h2 className="text-3xl font-bold mt-1">
                  Финансовая модель бизнеса
                </h2>
                <p className="text-slate-500 mt-2">
                  Многопродуктовая модель с EBITDA, налогами, Cash Flow и сценарным анализом.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {Object.entries(scenarioConfig).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScenario(key as ScenarioKey)}
                    className={`px-4 py-2 rounded-2xl border transition ${
                      scenario === key
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-green-50"
                    }`}
                  >
                    {value.title}
                  </button>
                ))}
              </div>
            </header>

            <section className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 space-y-4">
              <h3 className="text-xl font-semibold">Налоговый режим</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(taxModeConfig) as TaxMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTaxMode(mode)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      taxMode === mode
                        ? "border-green-600 bg-green-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold">{taxModeConfig[mode].title}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {taxModeConfig[mode].description}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              <div className="xl:col-span-2 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-3xl p-5 shadow-sm">
                <div className="text-sm text-green-100">Выручка за период</div>
                <div className="text-3xl font-bold mt-3">
                  {formatNumber(totalRevenue)}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-green-100 p-5 shadow-sm">
                <div className="text-sm text-slate-500">Валовая прибыль</div>
                <div className="text-2xl font-bold mt-3">
                  {formatNumber(totalGrossProfit)}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-green-100 p-5 shadow-sm">
                <div className="text-sm text-slate-500">EBITDA</div>
                <div className="text-2xl font-bold mt-3">
                  {formatNumber(totalEbitda)}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-green-100 p-5 shadow-sm">
                <div className="text-sm text-slate-500">Налоги</div>
                <div className="text-2xl font-bold mt-3 text-amber-600">
                  {formatNumber(totalTax)}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-green-100 p-5 shadow-sm">
                <div className="text-sm text-slate-500">Чистая прибыль</div>
                <div
                  className={`text-2xl font-bold mt-3 ${
                    totalNetProfit >= 0 ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {formatNumber(totalNetProfit)}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-3xl border border-green-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Продукты</h3>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="rounded-2xl bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition"
                  >
                    + Добавить продукт
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <input
                          className="border border-slate-300 bg-white px-3 py-2 rounded-xl w-full max-w-sm"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(product.id, "name", e.target.value)
                          }
                        />
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="rounded-xl border border-red-200 text-red-700 px-3 py-2 hover:bg-red-50"
                          >
                            Удалить
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <NumberInput
                          label="Цена продажи"
                          value={product.price}
                          onChange={(val) => updateProduct(product.id, "price", val)}
                        />

                        <NumberInput
                          label="Стартовый объём"
                          value={product.volume}
                          onChange={(val) => updateProduct(product.id, "volume", val)}
                        />

                        <NumberInput
                          label="Рост в месяц"
                          value={product.growth}
                          onChange={(val) => updateProduct(product.id, "growth", val)}
                          step="0.1"
                          suffix="%"
                        />

                        <NumberInput
                          label="Себестоимость единицы"
                          value={product.costPerUnit}
                          onChange={(val) =>
                            updateProduct(product.id, "costPerUnit", val)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 space-y-5">
                  <h3 className="text-xl font-semibold">Параметры модели</h3>

                  <div className="space-y-4">
                    <NumberInput
                      label="Горизонт прогноза"
                      value={months}
                      onChange={setMonths}
                    />

                    <NumberInput
                      label="Стартовый остаток денег"
                      value={startingCash}
                      onChange={setStartingCash}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <h4 className="font-semibold mb-3">Операционные расходы</h4>

                    <div className="space-y-4">
                      <NumberInput
                        label="Маркетинг"
                        value={marketing}
                        onChange={setMarketing}
                      />

                      <NumberInput
                        label="Зарплаты"
                        value={salaryCosts}
                        onChange={setSalaryCosts}
                      />

                      <NumberInput
                        label="Аренда"
                        value={rentCosts}
                        onChange={setRentCosts}
                      />

                      <NumberInput
                        label="Прочие расходы"
                        value={otherOpex}
                        onChange={setOtherOpex}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 space-y-5">
                  <h3 className="text-xl font-semibold">Переменные расходы</h3>

                  <div className="space-y-4">
                    <NumberInput
                      label="Комиссия банка"
                      value={bankCommissionRate}
                      onChange={setBankCommissionRate}
                      step="0.1"
                      suffix="%"
                    />

                    <NumberInput
                      label="% KPI команды"
                      value={teamKpiRate}
                      onChange={setTeamKpiRate}
                      step="0.1"
                      suffix="%"
                    />

                    <NumberInput
                      label="% ДРР"
                      value={drrRate}
                      onChange={setDrrRate}
                      step="0.1"
                      suffix="%"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Комиссия банка</div>
                      <div className="text-xl font-bold mt-2">
                        {formatNumber(totalBankCommission)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">KPI команды</div>
                      <div className="text-xl font-bold mt-2">
                        {formatNumber(totalTeamKpi)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">ДРР</div>
                      <div className="text-xl font-bold mt-2">
                        {formatNumber(totalDrr)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Себестоимость</div>
                      <div className="text-xl font-bold mt-2">
                        {formatNumber(totalCogs)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl bg-green-50 p-4">
                      <div className="text-sm text-slate-500">Прибыльных месяцев</div>
                      <div className="text-2xl font-bold mt-2 text-green-700">
                        {profitableMonths}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-red-50 p-4">
                      <div className="text-sm text-slate-500">Убыточных месяцев</div>
                      <div className="text-2xl font-bold mt-2 text-red-600">
                        {lossMonths}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Конечный остаток денег</div>
                    <div
                      className={`text-2xl font-bold mt-2 ${
                        endingCash >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatNumber(endingCash)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Выручка, EBITDA и чистая прибыль
                </h3>
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <LineChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                      <XAxis dataKey="month" stroke="#475569" />
                      <YAxis stroke="#475569" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #dcfce7",
                          borderRadius: "16px",
                          color: "#0f172a",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Выручка"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="ebitda"
                        name="EBITDA"
                        stroke="#0f766e"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="netProfit"
                        name="Чистая прибыль"
                        stroke="#475569"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Cash Flow и остаток денег
                </h3>
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <BarChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                      <XAxis dataKey="month" stroke="#475569" />
                      <YAxis stroke="#475569" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #dcfce7",
                          borderRadius: "16px",
                          color: "#0f172a",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="cashFlow"
                        name="Cash Flow"
                        fill="#22c55e"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="endingCash"
                        name="Остаток денег"
                        fill="#86efac"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Таблица прогноза</h3>
                <div className="text-sm text-slate-500">
                  {forecast.length} мес.
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-green-100 text-slate-900">
                    <tr>
                      <th className="text-left p-3 font-semibold">Месяц</th>
                      <th className="text-left p-3 font-semibold">Ед. продаж</th>
                      <th className="text-left p-3 font-semibold">Выручка</th>
                      <th className="text-left p-3 font-semibold">Себестоимость</th>
                      <th className="text-left p-3 font-semibold">Комиссия банка</th>
                      <th className="text-left p-3 font-semibold">KPI команды</th>
                      <th className="text-left p-3 font-semibold">ДРР</th>
                      <th className="text-left p-3 font-semibold">Переменные расходы</th>
                      <th className="text-left p-3 font-semibold">Валовая прибыль</th>
                      <th className="text-left p-3 font-semibold">OPEX</th>
                      <th className="text-left p-3 font-semibold">EBITDA</th>
                      <th className="text-left p-3 font-semibold">Налог</th>
                      <th className="text-left p-3 font-semibold">Чистая прибыль</th>
                      <th className="text-left p-3 font-semibold">Cash Flow</th>
                      <th className="text-left p-3 font-semibold">Остаток денег</th>
                      <th className="text-left p-3 font-semibold">Gross Margin %</th>
                      <th className="text-left p-3 font-semibold">Net Margin %</th>
                      <th className="text-left p-3 font-semibold">Налог % от выручки</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white text-slate-800">
                    {forecast.map((row, index) => {
                      const profitClass =
                        row.netProfit >= 0
                          ? "text-green-700 font-semibold"
                          : "text-red-600 font-semibold";

                      return (
                        <tr
                          key={row.month}
                          className={index % 2 === 0 ? "bg-white" : "bg-green-50/40"}
                        >
                          <td className="p-3 border-t border-slate-200">{row.month}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.units)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.revenue)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.cogs)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.bankCommission)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.teamKpi)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.drr)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.totalVariableExpenses)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.grossProfit)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.totalOpex)}</td>
                          <td className="p-3 border-t border-slate-200">{formatNumber(row.ebitda)}</td>
                          <td className="p-3 border-t border-slate-200 text-amber-600 font-semibold">
                            {formatNumber(row.tax)}
                          </td>
                          <td className={`p-3 border-t border-slate-200 ${profitClass}`}>
                            {formatNumber(row.netProfit)}
                          </td>
                          <td className={`p-3 border-t border-slate-200 ${profitClass}`}>
                            {formatNumber(row.cashFlow)}
                          </td>
                          <td
                            className={`p-3 border-t border-slate-200 ${
                              row.endingCash >= 0
                                ? "text-slate-800"
                                : "text-red-600 font-semibold"
                            }`}
                          >
                            {formatNumber(row.endingCash)}
                          </td>
                          <td className="p-3 border-t border-slate-200">{row.grossMargin}%</td>
                          <td
                            className={`p-3 border-t border-slate-200 ${
                              row.netMargin >= 0 ? "text-green-700" : "text-red-600"
                            }`}
                          >
                            {row.netMargin}%
                          </td>
                          <td className="p-3 border-t border-slate-200">
                            {row.effectiveTaxRate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}