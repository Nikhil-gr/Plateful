import { Router } from "express";
import { z } from "zod";
import { FoodListing } from "../models/FoodListing.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, allowRoles("admin"));
router.get("/stats", async (_req, res, next) => {
  try {
    const [users, businesses, listings, orders, revenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "business" }),
      FoodListing.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["completed", "ready_for_pickup"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      users,
      businesses,
      listings,
      orders,
      revenue: revenue[0]?.total ?? 0,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/users", async (_req, res, next) => {
  try {
    res.json(
      await User.find().select("-password").sort({ createdAt: -1 }).limit(100),
    );
  } catch (error) {
    next(error);
  }
});
router.patch("/users/:id", async (req, res, next) => {
  try {
    const updates = z
      .object({
        name: z.string().min(2).optional(),
        role: z.enum(["customer", "business", "admin"]).optional(),
        phone: z.string().max(40).optional(),
        location: z.string().max(120).optional(),
      })
      .parse(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});
router.get("/orders", async (_req, res, next) => {
  try {
    res.json(
      await Order.find()
        .populate("customer business items.listing")
        .sort({ createdAt: -1 })
        .limit(100),
    );
  } catch (error) {
    next(error);
  }
});
export default router;
