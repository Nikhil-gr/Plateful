import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "development-only-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
};
