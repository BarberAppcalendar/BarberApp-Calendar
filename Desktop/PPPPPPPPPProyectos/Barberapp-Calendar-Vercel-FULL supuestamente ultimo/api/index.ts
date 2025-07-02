import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { subscriptionMonitor } from "./subscription-monitor";

const app = express();

// CORS configuration to fix cross-origin issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Optimizaciones para 100 clientes simultáneos
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Rate limiting simple para evitar spam
const rateLimitStore = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 1000; // 1000 requests por minuto por IP

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const userRate = rateLimitStore.get(ip);
  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + windowMs;
  } else {
    userRate.count++;
  }

  if (userRate.count > maxRequests) {
    return res.status(429).json({ error: 'Demasiadas peticiones. Intenta en 1 minuto.' });
  }

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  const startServer = (attemptPort: number) => {
    const serverInstance = server.listen({
      port: attemptPort,
      host: "0.0.0.0",
    }, () => {
      log(`🔥 Firebase-only BarberApp serving on port ${attemptPort}`);
    });

    serverInstance.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`❌ Port ${attemptPort} is already in use. Trying port ${attemptPort + 1}...`);
        startServer(attemptPort + 1);
      } else {
        log(`❌ Server error: ${err.message}`);
        process.exit(1);
      }
    });

    serverInstance.on('listening', () => {
      // Solo iniciar el monitor una vez cuando el servidor esté escuchando
      if (!subscriptionMonitor.isRunning) {
        subscriptionMonitor.start();
        log(`📊 Subscription monitor started - checking every 6 hours`);
      }
    });
  };

  startServer(port);
})();