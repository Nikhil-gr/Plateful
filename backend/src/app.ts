import cors from "cors";
import express from "express";

import { env } from "./config/env.js";

import auth from "./routes/auth.js";
import listings from "./routes/listings.js";
import orders from "./routes/orders.js";
import admin from "./routes/admin.js";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", auth);
app.use("/api/listings", listings);
app.use("/api/orders", orders);
app.use("/api/admin", admin);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid request",
        details: error,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  },
);
