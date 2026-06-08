export type ColumnType = "number" | "date" | "category" | "text";

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  uniqueValues: any[];
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
}

export interface SheetData {
  records: any[];
  columns: string[];
  columnInfos: ColumnInfo[];
  sheetUrl: string;
}

export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

export interface FilterState {
  search: string;
  columnFilters: { [columnName: string]: any[] }; // Supporting multiple selected values
}

export type ViewType = "table" | "dashboard" | "acta";
export type ThemeType = "light" | "dark" | "black";
