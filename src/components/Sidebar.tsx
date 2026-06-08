import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search, RotateCcw, SlidersHorizontal, Eye, EyeOff, Check, X, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    sheetData,
    filterState,
    setFilterState,
    visibleColumns,
    toggleColumnVisibility,
    resetFilters,
    refreshData,
    loading,
    theme,
  } = useApp();

  const [expandedSection, setExpandedSection] = useState<{ [key: string]: boolean }>({
    columns: true,
  });

  const [filterSearchQuery, setFilterSearchQuery] = useState<{ [key: string]: string }>({});

  if (!sheetData) return null;

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter column values based on sub-search boxes
  const handleFilterSearchChange = (colName: string, query: string) => {
    setFilterSearchQuery((prev) => ({ ...prev, [colName]: query }));
  };

  // Handle checking / unchecking filter options
  const handleCheckboxChange = (colName: string, value: string, checked: boolean) => {
    setFilterState((prev) => {
      const currentFilters = [...(prev.columnFilters[colName] || [])];
      let updatedFilters;
      if (checked) {
        updatedFilters = [...currentFilters, value];
      } else {
        updatedFilters = currentFilters.filter((v) => v !== value);
      }
      
      const newColumnFilters = { ...prev.columnFilters };
      if (updatedFilters.length > 0) {
        newColumnFilters[colName] = updatedFilters;
      } else {
        delete newColumnFilters[colName];
      }

      return {
        ...prev,
        columnFilters: newColumnFilters,
      };
    });
  };

  const clearColumnFilter = (colName: string) => {
    setFilterState((prev) => {
      const newColumnFilters = { ...prev.columnFilters };
      delete newColumnFilters[colName];
      return {
        ...prev,
        columnFilters: newColumnFilters,
      };
    });
  };

  const categoricalColumns = sheetData.columnInfos.filter(
    (c) => c.type === "category" || c.type === "text"
  );

  return (
    <aside id="sidebar-controls" className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r p-5 flex flex-col gap-6 overflow-y-auto max-h-none lg:max-h-[calc(100vh-64px)] scrollbar-thin transition-colors duration-150 ${theme === "black" ? "bg-black border-neutral-800 text-neutral-200" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
      {/* Action panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Filtros y Controles
          </h2>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 ${theme === "black" ? "hover:bg-neutral-900" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}
          title="Actualizar datos de la hoja"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>

      {/* Global search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Búsqueda Global
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en todos los campos..."
            value={filterState.search}
            onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
            className={`w-full pl-9 pr-8 py-2 border rounded-lg text-sm transition-colors focus:outline-none ${theme === "black" ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-teal-500" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:border-teal-600 dark:focus:border-teal-500"}`}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          {filterState.search && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, search: "" }))}
              className={`absolute right-2.5 top-2.5 p-0.5 rounded-full text-slate-400 ${theme === "black" ? "hover:bg-neutral-800" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <hr className={`transition-colors ${theme === "black" ? "border-neutral-800" : "border-slate-150 dark:border-slate-700"}`} />

      {/* Columns show/hide */}
      <div className="space-y-1">
        <button
          onClick={() => toggleSection("columns")}
          className="flex items-center justify-between w-full text-left font-semibold text-xs text-slate-500 dark:text-slate-400 py-1 uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>Columnas Visuales ({visibleColumns.length})</span>
          {expandedSection["columns"] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {expandedSection["columns"] && (
          <div className="pt-2 pb-1 grid grid-cols-2 lg:grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {sheetData.columns.map((colName) => {
              const isVisible = visibleColumns.includes(colName);
              return (
                <button
                  key={colName}
                  onClick={() => toggleColumnVisibility(colName)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors truncate ${
                    isVisible
                      ? (theme === "black" ? "bg-teal-950/60 text-teal-300 border border-teal-800" : "bg-teal-50/60 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900")
                      : (theme === "black" ? "bg-neutral-950 text-neutral-400 border border-neutral-800 hover:bg-neutral-900" : "bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800")
                  }`}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{colName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <hr className={`transition-colors ${theme === "black" ? "border-neutral-800" : "border-slate-150 dark:border-slate-700"}`} />

      {/* Categorical filters */}
      <div className="flex-1 flex flex-col gap-5 min-h-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Filtros de Datos ({Object.keys(filterState.columnFilters).length} activos)
        </span>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-thin">
          {categoricalColumns.map((col) => {
            const selectedVals = filterState.columnFilters[col.name] || [];
            const isExpanded = expandedSection[col.name] ?? false;
            const subQuery = filterSearchQuery[col.name] || "";

            // Limit options rendering if too many, or query match
            const matchedOptions = col.uniqueValues.filter((val) =>
              String(val).toLowerCase().includes(subQuery.toLowerCase())
            );

            // Keep selected items in view anyway
            const finalOptionsToShow = Array.from(
              new Set([
                ...selectedVals,
                ...matchedOptions.slice(0, 15) // Top matching
              ])
            ).slice(0, 30); // Hard limit to keep layout fast and clean

            return (
              <div
                key={col.name}
                className={`border rounded-xl overflow-hidden transition-colors ${theme === "black" ? "bg-neutral-950/60 border-neutral-800" : "bg-slate-50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-755"}`}
              >
                {/* Header */}
                <div
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none border-b transition-colors ${theme === "black" ? "border-neutral-800 hover:bg-neutral-900/50" : "border-slate-150 dark:border-slate-755 hover:bg-slate-100 dark:hover:bg-slate-800/50"}`}
                  onClick={() => toggleSection(col.name)}
                >
                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 truncate">
                      {col.name}
                    </span>
                    {selectedVals.length > 0 && (
                      <span className="text-[10px] bg-teal-600 dark:bg-teal-500 text-white font-semibold h-4 w-4 rounded-full flex items-center justify-center shrink-0">
                        {selectedVals.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedVals.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearColumnFilter(col.name);
                        }}
                        className={`p-0.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors ${theme === "black" ? "hover:bg-neutral-900" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Checklist options */}
                {isExpanded && (
                  <div className="p-3 space-y-2.5">
                    {/* Tiny Searchbox inside for search list */}
                    {col.uniqueValues.length > 6 && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filtrar valores..."
                          value={subQuery}
                          onChange={(e) => handleFilterSearchChange(col.name, e.target.value)}
                          className={`w-full px-2.5 py-1 border rounded-md text-xs transition-colors focus:outline-none ${theme === "black" ? "bg-black border-neutral-800 text-slate-300 placeholder-neutral-500 focus:border-teal-500" : "bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:border-teal-600"}`}
                        />
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                      {finalOptionsToShow.map((val) => {
                        const valStr = String(val === null || val === undefined ? "" : val);
                        const isChecked = selectedVals.includes(valStr);

                        return (
                          <label
                            key={valStr}
                            className="flex items-center gap-2 text-xs font-normal text-slate-600 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white truncate"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(col.name, valStr, e.target.checked)}
                              className="h-3.5 w-3.5 text-teal-605 border-slate-305 dark:border-slate-705 rounded-sm focus:ring-teal-550/35 bg-white dark:bg-slate-900"
                            />
                            <span className="truncate" title={valStr}>
                              {valStr || <em className="text-slate-400 font-light">Vacío</em>}
                            </span>
                          </label>
                        );
                      })}

                      {finalOptionsToShow.length === 0 && (
                        <div className="text-center text-[11px] py-2 text-slate-400 font-light">
                          No hay coincidencia
                        </div>
                      )}
                    </div>

                    {col.uniqueValues.length > finalOptionsToShow.length && (
                      <div className="text-[10px] text-right text-slate-400 italic">
                        Mostrando {finalOptionsToShow.length} de {col.uniqueValues.length}...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Area */}
      <div className={`mt-auto pt-4 border-t flex gap-2.5 shrink-0 ${theme === "black" ? "border-neutral-800" : "border-slate-200 dark:border-slate-750"}`}>
        <button
          onClick={resetFilters}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${theme === "black" ? "bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-slate-300" : "bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Filtros
        </button>
      </div>
    </aside>
  );
};
