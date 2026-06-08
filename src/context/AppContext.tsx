import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { SheetData, FilterState, SortConfig, ViewType, ThemeType } from "../types";
import { fetchSheetData } from "../services/googleSheets";

interface AppContextType {
  sheetData: SheetData | null;
  loading: boolean;
  error: string | null;
  activeTab: ViewType;
  setActiveTab: (tab: ViewType) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  toggleColumnVisibility: (colName: string) => void;
  filteredRecords: any[];
  resetFilters: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewType>("table");
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeType;
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const [filterState, setFilterState] = useState<FilterState>({
    search: "",
    columnFilters: {},
  });

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Apply dark mode theme class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark" || theme === "black") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (theme === "black") {
      root.classList.add("black");
    } else {
      root.classList.remove("black");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "black";
      return "light";
    });
  }, []);

  // Fetch sheet data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSheetData();
      setSheetData(data);
      setVisibleColumns(data.columns); // Show all columns initially
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudieron cargar los datos de Google Sheets. Asegúrate de que el servidor está conectado.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle column visibility toggling
  const toggleColumnVisibility = useCallback((colName: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(colName)) {
        // Guarantee at least 1 column is visible
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c !== colName);
      } else {
        return [...prev, colName];
      }
    });
  }, []);

  // Reset filtering and sorting conditions
  const resetFilters = useCallback(() => {
    setFilterState({
      search: "",
      columnFilters: {},
    });
    setSortConfig(null);
  }, []);

  // Sincronized record calculations (Filters + Sorting + Global Search)
  const filteredRecords = useMemo(() => {
    if (!sheetData) return [];

    let result = [...sheetData.records];

    // 1. Global Search Filter
    if (filterState.search.trim() !== "") {
      const searchLower = filterState.search.toLowerCase().trim();
      result = result.filter((record) => {
        return Object.keys(record).some((key) => {
          const value = record[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // 2. Individual Column Filters (Multi-selection matched)
    Object.keys(filterState.columnFilters).forEach((colName) => {
      const selectedValues = filterState.columnFilters[colName];
      if (selectedValues && selectedValues.length > 0) {
        result = result.filter((record) => {
          const val = record[colName];
          return selectedValues.includes(String(val === null || val === undefined ? "" : val));
        });
      }
    });

    // 3. Sorting
    if (sortConfig) {
      const { column, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        // Handle null/undefined values
        if (valA === undefined || valA === null) return direction === "asc" ? 1 : -1;
        if (valB === undefined || valB === null) return direction === "asc" ? -1 : 1;

        // Try number sorting
        if (typeof valA === "number" && typeof valB === "number") {
          return direction === "asc" ? valA - valB : valB - valA;
        }

        // Standard string sorting
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return direction === "asc" ? -1 : 1;
        if (strA > strB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [sheetData, filterState, sortConfig]);

  return (
    <AppContext.Provider
      value={{
        sheetData,
        loading,
        error,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        filterState,
        setFilterState,
        sortConfig,
        setSortConfig,
        visibleColumns,
        setVisibleColumns,
        toggleColumnVisibility,
        filteredRecords,
        resetFilters,
        refreshData: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
