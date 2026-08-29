import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";
async function start() {
  if (!env.mongoUri)
    throw new Error(
      "MONGODB_URI is required. Copy .env.example to .env and configure it.",
    );
  await mongoose.connect(env.mongoUri);
  app.listen(env.port, () =>
    console.log(`Plateful API listening on http://localhost:${env.port}`),
  );
}
start().catch((error) => {
  console.error(error);
  process.exit(1);
});
