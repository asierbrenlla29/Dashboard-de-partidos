import React from "react";
import { useApp } from "../context/AppContext";
import { Database, TrendingUp, DollarSign, ListFilter, Hash } from "lucide-react";

export const KPICards: React.FC = () => {
  const { sheetData, filteredRecords, theme } = useApp();

  if (!sheetData) return null;

  // Find numerical columns to generate metrics
  const numericColumns = sheetData.columnInfos.filter((c) => c.type === "number");
  const totalRawRecords = sheetData.records.length;
  const activeCount = filteredRecords.length;

  // Let's extract up to 3 numerical columns to show as smart metrics
  const kpis = [];

  // General Status KPI
  kpis.push({
    title: "Registros Filtrados",
    value: `${activeCount} / ${totalRawRecords}`,
    sub: `${((activeCount / (totalRawRecords || 1)) * 100).toFixed(0)}% del total de filas`,
    icon: <Database className="w-5 h-5 text-teal-600" />,
  });

  numericColumns.slice(0, 3).forEach((col) => {
    // Calculate sum, average, max of current filtered subset
    let sum = 0;
    let validCount = 0;
    let max = -Infinity;

    filteredRecords.forEach((r) => {
      const val = Number(r[col.name]);
      if (!isNaN(val) && r[col.name] !== "" && r[col.name] !== null && r[col.name] !== undefined) {
        sum += val;
        validCount++;
        if (val > max) max = val;
      }
    });

    const avg = validCount > 0 ? parseFloat((sum / validCount).toFixed(1)) : 0;

    // Sum Card
    kpis.push({
      title: `Suma: ${col.name}`,
      value: sum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      sub: `Promedio: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: col.name.toLowerCase().includes("preci") || col.name.toLowerCase().includes("cost") || col.name.toLowerCase().includes("total") || col.name.toLowerCase().includes("monto") ? (
        <DollarSign className="w-5 h-5 text-emerald-500" />
      ) : (
        <TrendingUp className="w-5 h-5 text-teal-500" />
      ),
    });
  });

  // If there are few numerical columns, add categorical statistics
  if (kpis.length < 4) {
    const categoricalColumns = sheetData.columnInfos.filter((c) => c.type === "category");
    categoricalColumns.slice(0, 4 - kpis.length).forEach((col) => {
      // Find mode (most frequent category) in the filtered subset
      const counts: { [key: string]: number } = {};
      filteredRecords.forEach((r) => {
        const val = String(r[col.name] || "Vacío");
        counts[val] = (counts[val] || 0) + 1;
      });

      let topCategory = "N/A";
      let topCount = 0;
      Object.entries(counts).forEach(([cat, count]) => {
        if (count > topCount) {
          topCategory = cat;
          topCount = count;
        }
      });

      kpis.push({
        title: `Clase Principal: ${col.name}`,
        value: topCategory.length > 20 ? topCategory.substring(0, 18) + "..." : topCategory,
        sub: `Frecuencia: ${topCount} veces`,
        icon: <Hash className="w-5 h-5 text-teal-500" />,
      });
    });
  }

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.slice(0, 4).map((kpi, index) => (
        <div
          key={index}
          id={`kpi-card-${index}`}
          className={`rounded-xl p-5 shadow-sm flex items-start gap-4 transition-all ${
            theme === "black"
              ? "bg-black border border-neutral-800 hover:border-neutral-700"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className={`p-3 rounded-lg shrink-0 ${theme === "black" ? "bg-neutral-900" : "bg-slate-50 dark:bg-slate-900"}`}>
            {kpi.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate mb-1">
              {kpi.title}
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">
              {kpi.value}
            </div>
            <span className="block mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">
              {kpi.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
