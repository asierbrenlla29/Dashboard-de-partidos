import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { KPICards } from "./components/KPICards";
import { Sidebar } from "./components/Sidebar";
import { TableView } from "./components/TableView";
import { DashboardView } from "./components/DashboardView";
import { ActaView } from "./components/ActaView";
import {
  Sun,
  Moon,
  FileSpreadsheet,
  ExternalLink,
  AlertTriangle,
  LayoutDashboard,
  Table,
  Columns,
  RefreshCw,
  FileText,
} from "lucide-react";

// Skeletons pulse loading component for exceptional UX polish
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
      {/* 1. Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-4 w-72 bg-slate-150 dark:bg-slate-750 rounded-md"></div>
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>

      {/* 2. Top KPIs grids skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[2, 3, 4, 1].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700/60 rounded-xl border border-slate-150 dark:border-slate-700"></div>
        ))}
      </div>

      {/* 3. Main body skeletons */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar skeleton */}
        <div className="w-full lg:w-80 bg-slate-200 dark:bg-slate-700/40 h-96 rounded-xl shrink-0"></div>
        {/* Main section skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700/60 rounded-lg"></div>
          <div className="h-72 bg-slate-200 dark:bg-slate-700/30 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

// Main functional app content layout
const AppContent: React.FC = () => {
  const {
    sheetData,
    loading,
    error,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    toggleTheme,
    refreshData,
  } = useApp();

  // 1. Loading active state (Skeletons shown)
  if (loading && !sheetData) {
    return (
      <div className={`min-h-screen transition-colors flex items-center justify-center py-10 ${theme === "black" ? "bg-black" : "bg-slate-50 dark:bg-slate-900"}`}>
        <LoadingSkeleton />
      </div>
    );
  }

  // 2. Error active state (Amicable banners shown)
  if (error) {
    return (
      <div className={`min-h-screen transition-colors flex items-center justify-center p-4 ${theme === "black" ? "bg-black" : "bg-slate-50 dark:bg-slate-900"}`}>
        <div className={`border rounded-2xl p-6 md:p-8 max-w-lg w-full text-center shadow-lg space-y-4 ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Error de Conexión de Datos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {error}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
               onClick={refreshData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar Conexión
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1Bxl41qsmro3f8L-_AVtoeKi37_QzPNXevjBPO_E7LPY/edit?gid=44644585"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-teal-600 hover:underline flex items-center justify-center gap-1.5"
            >
              <span>Ver Hoja Original en Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-150 ${theme === "black" ? "bg-black" : "bg-slate-50 dark:bg-slate-900"}`}>
      {/* Dynamic Header Navbar */}
      <header className={`sticky top-0 z-30 shadow-xs border-b ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand header */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 rounded-lg text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Google Sheets Visualizer
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-medium">Hoja Conectada</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls Area */}
          <div className="flex items-center gap-3.5">
            {/* Sheet Reference URL */}
            {sheetData?.sheetUrl && (
              <a
                href={sheetData.sheetUrl}
                target="_blank"
                rel="noreferrer"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${theme === "black" ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-slate-300" : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
               >
                <span>Fuente Google Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Tab switch button filters */}
            <div className={`p-1 rounded-lg flex items-center gap-1 ${theme === "black" ? "bg-neutral-900 border border-neutral-800" : "bg-slate-100 dark:bg-slate-900"}`}>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "table"
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : (theme === "black" ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300")
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hoja de Datos</span>
                <span className="sm:hidden">Tabla</span>
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : (theme === "black" ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300")
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Estadísticas</span>
                <span className="sm:hidden">Gráficos</span>
              </button>
              <button
                onClick={() => setActiveTab("acta")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "acta"
                    ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : (theme === "black" ? "text-neutral-400 hover:text-neutral-200" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300")
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Acta</span>
                <span className="sm:hidden">Acta</span>
              </button>
            </div>

            <span className={`h-5 w-px ${theme === "black" ? "bg-neutral-800" : "bg-slate-200 dark:bg-slate-700"}`}></span>

            {/* Three-way segmented picker for Light, standard Slate Dark, and OLED pure Black backgrounds */}
            <div className={`flex rounded-lg p-0.5 border transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-800" : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700"}`}>
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${theme === "light" ? "bg-white text-teal-600 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900"}`}
                title="Modo Claro"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${theme === "dark" ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
                title="Modo Oscuro (Gris)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("black")}
                className={`p-1.5 rounded-md text-xs transition-all cursor-pointer text-center flex items-center justify-center font-bold ${theme === "black" ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-50"}`}
                title="Modo Fondo Negro (OLED Pure Black)"
              >
                <span className="text-[10px] tracking-tight leading-none px-1">Negro</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Upper auto-analyzed KPI blocks */}
        <KPICards />

        {/* Workspace Body splits */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Controls filters sidebar */}
          <Sidebar />

          {/* Core analytical frame */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === "table" ? (
              <TableView />
            ) : activeTab === "dashboard" ? (
              <DashboardView />
            ) : (
              <ActaView />
            )}
          </div>
        </div>
      </main>

      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t text-center text-xs text-slate-400 dark:text-slate-500 space-y-1 transition-colors ${theme === "black" ? "border-neutral-800 bg-black" : "border-slate-200 dark:border-slate-800"}`}>
        <p>Google Sheets Visualizer &bull; Looker Analytics Engine</p>
        <p>Hoja origen: https://docs.google.com/spreadsheets/d/1Bxl41qsmro3f8L-_AVtoeKi37_QzPNXevjBPO_E7LPY/...</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
