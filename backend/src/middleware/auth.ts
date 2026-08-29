import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Role } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(header.slice(7), env.jwtSecret) as {
      id: string;
      role: Role;
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
export function allowRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) =>
    !req.user || !roles.includes(req.user.role)
      ? res.status(403).json({ message: "Insufficient permissions" })
      : next();
}
