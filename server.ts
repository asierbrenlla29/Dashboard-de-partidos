import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve JSON properly
  app.use(express.json());

  // API Route: fetch Google Sheet and return JSON
  app.get("/api/data", async (req, res) => {
    try {
      const sheetId = "1Bxl41qsmro3f8L-_AVtoeKi37_QzPNXevjBPO_E7LPY";
      const gid = "44644585";
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet data, status: ${response.status}`);
      }
      const csvText = await response.text();
      
      // Parse CSV using PapaParse
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically converts numbers/booleans
      });
      
      if (parseResult.errors && parseResult.errors.length > 0) {
        console.warn("CSV parsing warnings:", parseResult.errors);
      }
      
      const records = parseResult.data;
      const columns = parseResult.meta.fields || [];
      
      res.json({
        success: true,
        data: records,
        columns: columns,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?gid=${gid}`
      });
    } catch (error: any) {
      console.error("Error fetching or parsing Google Sheets data:", error);
      res.status(500).json({
        success: false,
        error: error.message || "An error occurred while fetching Google Sheets data."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
