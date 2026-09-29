import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import membersRoutes from "./routes/members.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import activitiesRoutes from "./routes/activities.routes.js";
import domainsRoutes from "./routes/domains.routes.js";
import contentRoutes from "./routes/content.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import contactRoutes from "./routes/contact.routes.js";

const app = express();
// Behind Vercel's proxy: needed for correct client IPs (login rate limiting).
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL || "https://cipher-one-jet.vercel.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true); // Allow during initial setup or adjust to strict in production
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cipher-default-dev-secret-replace-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Serve local uploads
app.use("/uploads", express.static(path.resolve(process.cwd(), "public", "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin/members", membersRoutes);
app.use("/api/admin/projects", projectsRoutes);
app.use("/api/admin/events", eventsRoutes);
app.use("/api/admin/activities", activitiesRoutes);
app.use("/api/admin/domains", domainsRoutes);
app.use("/api/admin/content", contentRoutes);
app.use("/api/admin/media", mediaRoutes);
app.use("/api", blogRoutes); // handles /api/public/blog and /api/admin/blog
app.use("/api", applicationsRoutes); // handles /api/public/join and /api/admin/applications
app.use("/api", contactRoutes); // handles /api/public/contact and /api/admin/messages



// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// On Vercel the app is served as a serverless function (server/api/index.ts), so no listener there.
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Cipher API] Server running on http://localhost:${PORT}`);
  });
}

export default app;

