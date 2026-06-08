import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Eye, TableProperties, HelpCircle, ChevronsLeft, ChevronsRight } from "lucide-react";

export const TableView: React.FC = () => {
  const {
    sheetData,
    filteredRecords,
    visibleColumns,
    sortConfig,
    setSortConfig,
    theme,
  } = useApp();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Reset page when records change to prevent page overflows
  useMemo(() => {
    setCurrentPage(1);
  }, [filteredRecords.length]);

  if (!sheetData) return null;

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Handle Header Click for Sorting
  const handleSort = (colName: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.column === colName) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ column: colName, direction });
  };

  // Convert currently filtered records matching visible columns into an Excel-ready UTF-8 CSV
  const handleCsvExport = (filenamePrefix: string = "excel_sheets_export") => {
    if (filteredRecords.length === 0) return;

    const cols = visibleColumns.length > 0 ? visibleColumns : sheetData.columns;

    // Generate Headers & values
    const headers = cols.map((colName) => `"${String(colName).replace(/"/g, '""')}"`).join(",");
    const rows = filteredRecords.map((r) =>
      cols
        .map((colName) => {
          const val = r[colName];
          const valStr = val === null || val === undefined ? "" : String(val);
          return `"${valStr.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    // Prepend UTF-8 Byte Order Mark (BOM) so Excel reads international characters (ñ, á, ó...) perfectly
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const tokenDate = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filenamePrefix}_${tokenDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="table-view-section" className={`flex-1 flex flex-col min-w-0 rounded-xl border shadow-sm overflow-hidden transition-colors duration-150 ${theme === "black" ? "bg-black border-neutral-800" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80"}`}>
      {/* Table Toolbar */}
      <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 transition-colors ${theme === "black" ? "bg-neutral-950/40 border-neutral-805" : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700/80"}`}>
        <div className="flex items-center gap-2">
          <TableProperties className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Hoja de Datos ({filteredRecords.length} filas coinciden)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer transition-colors ${theme === "black" ? "bg-black border-neutral-800 text-neutral-300 focus:border-teal-500" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:border-teal-600"}`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span className={`h-4 w-px inline-block transition-colors ${theme === "black" ? "bg-neutral-800" : "bg-slate-200 dark:bg-slate-700"}`}></span>

          {/* Export Actions dropdown */}
          <div className="flex gap-2">
            <button
              onClick={() => handleCsvExport("sheets_data")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${theme === "black" ? "bg-teal-950/40 hover:bg-teal-900/60 text-teal-400 border border-teal-900" : "bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/60"}`}
              title="Descargar archivo .csv compatible con Excel, Sheets o UTF-8"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => handleCsvExport("excel_output")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${theme === "black" ? "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900" : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60"}`}
              title="Descargar para abrir con Microsoft Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Table area */}
      <div className="flex-1 overflow-auto max-h-[550px] scrollbar-thin">
        <table className="w-full text-left border-collapse table-auto relative">
          <thead className={`sticky top-0 z-10 shadow-xs border-b transition-colors ${theme === "black" ? "bg-neutral-950 border-neutral-808" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/80"}`}>
            <tr>
              {visibleColumns.map((colName) => {
                const isSorted = sortConfig?.column === colName;
                const columnMeta = sheetData.columnInfos.find((c) => c.name === colName);

                return (
                  <th
                    key={colName}
                    onClick={() => handleSort(colName)}
                    className={`px-4.5 py-3 cursor-pointer select-none transition-colors group text-xs font-semibold max-w-[200px] border-b ${theme === "black" ? "hover:bg-neutral-900 text-neutral-400 border-neutral-808" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate" title={colName}>
                        {colName}
                      </span>
                      <ArrowUpDown
                        className={`w-3 h-3 shrink-0 transition-opacity ${
                          isSorted
                            ? "text-teal-600 dark:text-teal-400 opacity-100 animate-pulse"
                            : "opacity-35 group-hover:opacity-100"
                        }`}
                      />
                      {/* Show tiny icon based on identified type on hover */}
                      <span
                        className="hidden group-hover:inline text-[9px] font-normal uppercase bg-slate-200/50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded truncate min-w-0"
                        title={`Tipo autodetectado: ${columnMeta?.type}`}
                      >
                        {columnMeta?.type}
                      </span>
                    </div>
                  </th>
                );
              })}
              {visibleColumns.length === 0 && (
                <th className="px-5 py-4 text-xs font-normal italic text-slate-400 text-center">
                  Por favor, activa al menos una columna en el panel de control.
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors ${theme === "black" ? "divide-neutral-800" : "divide-slate-150 dark:divide-slate-700/50"}`}>
            {paginatedRecords.map((record, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors focus-within:bg-slate-50/45 ${theme === "black" ? "hover:bg-neutral-900/30" : "hover:bg-slate-50/45 dark:hover:bg-slate-900/10"}`}
              >
                {visibleColumns.map((colName) => {
                  const cellVal = record[colName];
                  const colInfo = sheetData.columnInfos.find((c) => c.name === colName);

                  // Formatting values depending on identified type
                  let displayVal = String(cellVal === null || cellVal === undefined ? "" : cellVal);

                  let isNumber = colInfo?.type === "number";
                  
                  if (isNumber && typeof cellVal === "number") {
                    displayVal = cellVal.toLocaleString(undefined, { maximumFractionDigits: 4 });
                  }

                  return (
                    <td
                      key={colName}
                      className={`px-4.5 py-3 text-sm max-w-[220px] truncate ${
                        isNumber ? "font-mono text-right" : "text-left shadow-xs"
                      } ${theme === "black" ? "text-neutral-350 border-neutral-900" : "text-slate-700 dark:text-slate-350"}`}
                      title={String(cellVal || "")}
                    >
                      {displayVal === "" ? (
                        <span className={`italic text-xs ${theme === "black" ? "text-neutral-700" : "text-slate-300 dark:text-slate-600"}`}>&mdash;</span>
                      ) : (
                        displayVal
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {paginatedRecords.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length || 1}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-light italic"
                >
                  No hay filas que coincidan con la búsqueda o filtros activos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls footer */}
      <div className={`px-5 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 transition-colors ${theme === "black" ? "border-neutral-808 bg-neutral-950/40" : "border-slate-200 dark:border-slate-700/80 bg-slate-50/30 dark:bg-slate-905/20"}`}>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Mostrando filas{" "}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">
            {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{" "}
          al{" "}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">
            {Math.min(currentPage * pageSize, filteredRecords.length)}
          </strong>{" "}
          de{" "}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">
            {filteredRecords.length}
          </strong>{" "}
          registros
        </span>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 self-center">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md disabled:opacity-35 transition-colors cursor-pointer ${theme === "black" ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md disabled:opacity-35 transition-colors cursor-pointer ${theme === "black" ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
              Página {currentPage} de {totalPages}
            </span>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-md disabled:opacity-35 transition-colors cursor-pointer ${theme === "black" ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-md disabled:opacity-35 transition-colors cursor-pointer ${theme === "black" ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
