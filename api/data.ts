import type { IncomingMessage, ServerResponse } from "http";
import Papa from "papaparse";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const sheetId = "1Bxl41qsmro3f8L-_AVtoeKi37_QzPNXevjBPO_E7LPY";
    const gid = "44644585";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data, status: ${response.status}`);
    }
    const csvText = await response.text();
    
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.warn("CSV parsing warnings:", parseResult.errors);
    }
    
    const records = parseResult.data;
    const columns = parseResult.meta.fields || [];
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/json");
    
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      data: records,
      columns: columns,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=${gid}`
    }));
  } catch (error: any) {
    console.error("Vercel Function Error:", error);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    res.end(JSON.stringify({
      success: false,
      error: error.message || "An error occurred while fetching Google Sheets data."
    }));
  }
}
