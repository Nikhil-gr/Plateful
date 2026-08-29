import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AuthRequest, requireAuth } from "../middleware/auth.js";

const router = Router();
const registration = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "business"]).default("customer"),
});
const tokenFor = (user: { _id: unknown; role: string }) =>
  jwt.sign({ id: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: "7d",
  });
router.post("/register", async (req, res, next) => {
  try {
    const input = registration.parse(req.body);
    if (await User.exists({ email: input.email }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    const user = await User.create({
      ...input,
      password: await bcrypt.hash(input.password, 12),
    });
    res
      .status(201)
      .json({
        token: tokenFor(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const input = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(req.body);
    const user = await User.findOne({ email: input.email });
    if (!user || !(await bcrypt.compare(input.password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({
      token: tokenFor(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
export default router;
