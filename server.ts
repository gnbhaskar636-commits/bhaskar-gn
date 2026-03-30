import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { runDailyAutomation } from "./src/services/automationService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Manual trigger for automation
  app.get("/api/automation/run", async (req, res) => {
    const secret = req.query.secret;
    if (secret !== process.env.AUTOMATION_SECRET) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    
    try {
      await runDailyAutomation();
      res.json({ status: "success", message: "Automation triggered manually" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  });

  // Schedule daily automation at 8:25 PM PDT (03:25 UTC)
  // Cron format: minute hour day-of-month month day-of-week
  // 03:25 UTC is 8:25 PM PDT (UTC-7)
  cron.schedule("25 3 * * *", async () => {
    console.log("[CRON] Running scheduled daily automation at 03:25 UTC (8:25 PM PDT)...");
    try {
      await runDailyAutomation();
      console.log("[CRON] Scheduled daily automation completed.");
    } catch (error) {
      console.error("[CRON] Scheduled daily automation failed:", error);
    }
  }, {
    timezone: "UTC"
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
