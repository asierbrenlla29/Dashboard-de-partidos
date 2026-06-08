import { SheetData, ColumnInfo, ColumnType } from "../types";

export async function fetchSheetData(): Promise<SheetData> {
  const response = await fetch("/api/data");
  if (!response.ok) {
    throw new Error(`Error de red al obtener los datos de la hoja (${response.status})`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "No se pudieron recuperar los datos de la hoja.");
  }

  const rawRecords = result.data || [];
  const columns = result.columns || [];

  // Analyze columns to detect types & calculate metadata
  const columnInfos: ColumnInfo[] = columns.map((colName: string) => {
    // Collect all non-null values
    const values = rawRecords
      .map((r: any) => r[colName])
      .filter((v: any) => v !== undefined && v !== null && v !== "");

    // 1. Detect Numerical
    let numericCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    values.forEach((v: any) => {
      // Check if value is numeric. If it's a number or can be parsed as a number (and isn't a blank or boolean)
      const num = Number(v);
      if (!isNaN(num) && typeof v !== "boolean") {
        numericCount++;
        sum += num;
        if (num < min) min = num;
        if (num > max) max = num;
      }
    });

    const isNumeric = values.length > 0 && (numericCount / values.length) > 0.85;

    // 2. Detect Date
    let dateCount = 0;
    const dateRegex = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$|^\d{4}-\d{2}-\d{2}T/;
    
    values.forEach((v: any) => {
      if (typeof v === "string") {
        if (dateRegex.test(v.trim())) {
          dateCount++;
        } else {
          const timestamp = Date.parse(v);
          // Make sure it's not a generic word representing a false positive timestamp
          if (!isNaN(timestamp) && v.length > 5 && isNaN(Number(v))) {
            dateCount++;
          }
        }
      } else if (v instanceof Date) {
        dateCount++;
      }
    });

    const isDate = values.length > 0 && (dateCount / values.length) > 0.85;

    // 3. Find unique values sorted
    const uniqueValues = Array.from(new Set(values)).sort((a: any, b: any) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a).localeCompare(String(b));
    });

    // 4. Categorical vs Text classification
    let type: ColumnType = "text";
    if (isNumeric) {
      type = "number";
    } else if (isDate) {
      type = "date";
    } else if (uniqueValues.length <= 25 || uniqueValues.length < rawRecords.length * 0.3) {
      // Small cardinality relative to total dataset length, or standard small size means category
      type = "category";
    }

    const info: ColumnInfo = {
      name: colName,
      type,
      uniqueValues,
    };

    if (type === "number" && numericCount > 0) {
      info.min = min === Infinity ? undefined : min;
      info.max = max === -Infinity ? undefined : max;
      info.sum = sum;
      info.avg = parseFloat((sum / numericCount).toFixed(2));
    }

    return info;
  });

  return {
    records: rawRecords,
    columns,
    columnInfos,
    sheetUrl: result.sheetUrl,
  };
}
