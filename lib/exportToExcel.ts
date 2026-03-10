import * as XLSX from "xlsx";

type ProductRow = {
  Название: string;
  "Цена продажи": number;
  "Стартовый объём": number;
  "Рост в месяц %": number;
  "Себестоимость единицы": number;
};

type ForecastRow = {
  month: string;
  units: number;
  revenue: number;
  cogs: number;
  bankCommission: number;
  teamKpi: number;
  drr: number;
  totalVariableExpenses: number;
  grossProfit: number;
  marketing: number;
  salaries: number;
  rent: number;
  otherOpex: number;
  totalOpex: number;
  ebitda: number;
  tax: number;
  netProfit: number;
  cashFlow: number;
  endingCash: number;
  grossMargin: number;
  netMargin: number;
  effectiveTaxRate: number;
};

type ExportPayload = {
  scenarioTitle: string;
  taxModeTitle: string;
  taxModeDescription: string;
  months: number;
  startingCash: number;

  marketing: number;
  salaryCosts: number;
  rentCosts: number;
  otherOpex: number;

  bankCommissionRate: number;
  teamKpiRate: number;
  drrRate: number;

  totalRevenue: number;
  totalCogs: number;
  totalBankCommission: number;
  totalTeamKpi: number;
  totalDrr: number;
  totalGrossProfit: number;
  totalEbitda: number;
  totalTax: number;
  totalNetProfit: number;
  endingCash: number;
  profitableMonths: number;
  lossMonths: number;

  products: ProductRow[];
  forecast: ForecastRow[];
};

function setColumnWidths(worksheet: XLSX.WorkSheet, widths: number[]) {
  worksheet["!cols"] = widths.map((wch) => ({ wch }));
}

export function exportFinancialModelToExcel(data: ExportPayload) {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ["Финансовая модель бизнеса"],
    [""],
    ["Параметр", "Значение"],
    ["Сценарий", data.scenarioTitle],
    ["Налоговый режим", data.taxModeTitle],
    ["Описание налога", data.taxModeDescription],
    ["Горизонт прогноза (мес.)", data.months],
    ["Стартовый остаток денег", data.startingCash],
    [""],
    ["Маркетинг", data.marketing],
    ["Зарплаты", data.salaryCosts],
    ["Аренда", data.rentCosts],
    ["Прочие расходы", data.otherOpex],
    [""],
    ["Комиссия банка %", data.bankCommissionRate],
    ["KPI команды %", data.teamKpiRate],
    ["ДРР %", data.drrRate],
    [""],
    ["Выручка за период", data.totalRevenue],
    ["Себестоимость", data.totalCogs],
    ["Комиссия банка", data.totalBankCommission],
    ["KPI команды", data.totalTeamKpi],
    ["ДРР", data.totalDrr],
    ["Валовая прибыль", data.totalGrossProfit],
    ["EBITDA", data.totalEbitda],
    ["Налоги", data.totalTax],
    ["Чистая прибыль", data.totalNetProfit],
    ["Конечный остаток денег", data.endingCash],
    ["Прибыльных месяцев", data.profitableMonths],
    ["Убыточных месяцев", data.lossMonths],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  setColumnWidths(summarySheet, [30, 22]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Сводка");

  const productsSheetData = data.products.map((product) => ({
    Название: product.Название,
    "Цена продажи": product["Цена продажи"],
    "Стартовый объём": product["Стартовый объём"],
    "Рост в месяц %": product["Рост в месяц %"],
    "Себестоимость единицы": product["Себестоимость единицы"],
  }));

  const productsSheet = XLSX.utils.json_to_sheet(productsSheetData);
  setColumnWidths(productsSheet, [24, 16, 18, 16, 24]);
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Продукты");

  const forecastSheetData = data.forecast.map((row) => ({
    Месяц: row.month,
    "Ед. продаж": row.units,
    Выручка: row.revenue,
    Себестоимость: row.cogs,
    "Комиссия банка": row.bankCommission,
    "KPI команды": row.teamKpi,
    ДРР: row.drr,
    "Переменные расходы": row.totalVariableExpenses,
    "Валовая прибыль": row.grossProfit,
    Маркетинг: row.marketing,
    Зарплаты: row.salaries,
    Аренда: row.rent,
    "Прочие расходы": row.otherOpex,
    OPEX: row.totalOpex,
    EBITDA: row.ebitda,
    Налог: row.tax,
    "Чистая прибыль": row.netProfit,
    "Cash Flow": row.cashFlow,
    "Остаток денег": row.endingCash,
    "Gross Margin %": row.grossMargin,
    "Net Margin %": row.netMargin,
    "Налог % от выручки": row.effectiveTaxRate,
  }));

  const forecastSheet = XLSX.utils.json_to_sheet(forecastSheetData);
  setColumnWidths(forecastSheet, [
    10, 14, 14, 16, 18, 16, 12, 20, 18, 14, 14, 14, 18, 14, 14, 12, 16, 14, 16,
    16, 16, 18,
  ]);
  XLSX.utils.book_append_sheet(workbook, forecastSheet, "Прогноз");

  const fileName = `financial-model-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}