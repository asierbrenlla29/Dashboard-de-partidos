import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Sliders, Info } from "lucide-react";

export const DashboardView: React.FC = () => {
  const { sheetData, filteredRecords, theme } = useApp();

  // Selected configuration states
  const [groupColumn, setGroupColumn] = useState<string>("");
  const [metricColumn, setMetricColumn] = useState<string>("__count");
  const [metricType, setMetricType] = useState<"sum" | "avg" | "count">("count");

  // Dynamic initialization
  useMemo(() => {
    if (!sheetData) return;
    
    // Choose the best initially categorical column as grouping default
    const catCols = sheetData.columnInfos.filter((c) => c.type === "category" || c.type === "text" || c.type === "date");
    if (catCols.length > 0) {
      setGroupColumn(catCols[0].name);
    } else if (sheetData.columns.length > 0) {
      setGroupColumn(sheetData.columns[0].name);
    }

    // Set first numerical column as target metric if found
    const numCols = sheetData.columnInfos.filter((c) => c.type === "number");
    if (numCols.length > 0) {
      setMetricColumn(numCols[0].name);
      setMetricType("sum");
    } else {
      setMetricColumn("__count");
      setMetricType("count");
    }
  }, [sheetData]);

  if (!sheetData) return null;

  const categoricalColumns = sheetData.columnInfos.filter(
    (c) => c.type === "category" || c.type === "text" || c.type === "date"
  );
  const numericalColumns = sheetData.columnInfos.filter((c) => c.type === "number");

  // Handler for custom metric selector dropdown
  const handleMetricChange = (val: string) => {
    setMetricColumn(val);
    if (val === "__count") {
      setMetricType("count");
    } else {
      setMetricType("sum"); // Default for custom numeric columns
    }
  };

  // Group and Aggregate Records matching filter state
  const chartData = useMemo(() => {
    if (!filteredRecords.length || !groupColumn) return [];

    const groupMap: { [key: string]: { name: string; sum: number; count: number } } = {};

    filteredRecords.forEach((record) => {
      let rawVal = record[groupColumn];
      if (rawVal === undefined || rawVal === null || rawVal === "") {
        rawVal = "Vacío";
      }
      const label = String(rawVal);

      if (!groupMap[label]) {
        groupMap[label] = { name: label, sum: 0, count: 0 };
      }

      groupMap[label].count += 1;

      if (metricColumn !== "__count") {
        const valNum = Number(record[metricColumn]);
        if (!isNaN(valNum)) {
          groupMap[label].sum += valNum;
        }
      }
    });

    const parsedData = Object.values(groupMap).map((item) => {
      let value = item.count;
      if (metricType === "sum") {
        value = parseFloat(item.sum.toFixed(2));
      } else if (metricType === "avg") {
        value = item.count > 0 ? parseFloat((item.sum / item.count).toFixed(2)) : 0;
      }

      return {
        name: item.name,
        value,
      };
    });

    // Sort descending by calculated value, showing top 15 to safeguard UX cleanliness
    return parsedData.sort((a, b) => b.value - a.value).slice(0, 15);
  }, [filteredRecords, groupColumn, metricColumn, metricType]);

  // Color options for Pie Charts
  const COLORS = [
    "#0D9488", // Teal
    "#10B981", // Emerald
    "#0EA5E9", // Sky Blue
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Violet
    "#EF4444", // Red
    "#14B8A6", // Teal secondary
    "#F97316", // Orange
    "#06B6D4", // Cyan
  ];

  // Visual text & grids depending on theme (Light vs Dark mode)
  const isDark = theme === "dark" || theme === "black";
  const axisColor = isDark ? "#94A3B8" : "#64748B";
  const gridColor = theme === "black" ? "#1f1f1f" : (isDark ? "#334155" : "#E2E8F0");
  const tooltipBg = theme === "black" ? "#09090b" : (isDark ? "#1E293B" : "#FFFFFF");
  const tooltipText = isDark ? "#F8FAFC" : "#1E293B";
  const tooltipBorder = theme === "black" ? "#27272a" : (isDark ? "#475569" : "#CBD5E1");

  const metricLabel = useMemo(() => {
    if (metricType === "count") return "Recuento de Filas";
    const prefix = metricType === "sum" ? "Suma" : "Promedio";
    return `${prefix}: ${metricColumn}`;
  }, [metricColumn, metricType]);

  return (
    <div id="dashboard-view-panel" className="flex-1 flex flex-col gap-6 min-w-0">
      {/* 1. Interactive Control Panel Bar */}
      <div className={`border rounded-xl p-5 shadow-sm shrink-0 transition-colors ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Configuración del Gráfico
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
          {/* Group Column drop-down */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Eje X (Agrupación / Dimensión)
            </label>
            <select
              value={groupColumn}
              onChange={(e) => setGroupColumn(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer transition-colors ${theme === "black" ? "bg-black border-neutral-800 text-neutral-300 focus:border-teal-500" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-350 focus:border-teal-600"}`}
            >
              {categoricalColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type === "date" ? "Fecha" : "Categoría"})
                </option>
              ))}
              {categoricalColumns.length === 0 && (
                <option value="">No hay columnas categóricas</option>
              )}
            </select>
          </div>

          {/* Metric target column */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Eje Y (Métrica a Analizar)
            </label>
            <select
              value={metricColumn}
              onChange={(e) => handleMetricChange(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer transition-colors ${theme === "black" ? "bg-black border-neutral-800 text-neutral-300 focus:border-teal-500" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-350 focus:border-teal-600"}`}
            >
              <option value="__count">Recuento de Registros (Frecuencia)</option>
              {numericalColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  Valor Numérico: {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metric calculation type (Sum/Avg) - visible only if numeric column is chosen */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Operación de Métrica
            </label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as any)}
              disabled={metricColumn === "__count"}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-colors ${theme === "black" ? "bg-black border-neutral-800 text-neutral-300 focus:border-teal-500" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-350 focus:border-teal-600"}`}
            >
              {metricColumn === "__count" ? (
                <option value="count">Contar Filas</option>
              ) : (
                <>
                  <option value="sum">Sumar Valores (Suma)</option>
                  <option value="avg">Promediar Valores (Media)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Warning if too few records are matching standard visual charts */}
      {chartData.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950 rounded-xl p-5 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Sin datos para graficar</h4>
            <p className="text-xs mt-1">
              Las condiciones de filtrado actuales no devuelven registros válidos. Ajusta la búsqueda global o los desmarques en la barra lateral para poblar el panel.
            </p>
          </div>
        </div>
      )}

      {/* 2. Visual Graphs board rendering */}
      {chartData.length > 0 && (
        <div id="dashboard-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* A. Bar Chart Card */}
          <div className={`border rounded-xl p-5 shadow-sm flex flex-col h-[400px] transition-colors ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <BarChart3 className="w-4.5 h-4.5 text-teal-600 shrink-0" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                Distribución Comparativa (Barras)
              </h4>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    tick={{ fontSize: 10 }}
                    angle={chartData.length > 5 ? -15 : 0}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis stroke={axisColor} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      color: tooltipText,
                      borderColor: tooltipBorder,
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", pt: 10 }} />
                  <Bar
                    dataKey="value"
                    name={metricLabel}
                    fill="#0D9488"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* B. Line Chart Card */}
          <div className={`border rounded-xl p-5 shadow-sm flex flex-col h-[400px] transition-colors ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <LineIcon className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                Tendencia & Secuencias (Líneas)
              </h4>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    tick={{ fontSize: 10 }}
                    angle={chartData.length > 5 ? -15 : 0}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis stroke={axisColor} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      color: tooltipText,
                      borderColor: tooltipBorder,
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", pt: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={metricLabel}
                    stroke="#10B981"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C. Pie Chart Card (Proportions) - Stretching full width on Grid for amazing dashboard balance */}
          <div className={`border rounded-xl p-5 shadow-sm flex flex-col h-[400px] lg:col-span-2 transition-colors ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <PieIcon className="w-4.5 h-4.5 text-sky-500 shrink-0" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                Proporción / Participación del Total (Circular)
              </h4>
            </div>
            <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-3/5 h-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={2.5}
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name.length > 10 ? name.substring(0, 9) + "..." : name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={true}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        color: tooltipText,
                        borderColor: tooltipBorder,
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend to handle large categories beautifully inside card space */}
              <div className="w-full md:w-2/5 max-h-[250px] overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-1 gap-2.5 scrollbar-thin">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 sm:gap-2.5 truncate">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-auto">
                      ({item.value.toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
