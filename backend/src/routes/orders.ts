import { Router } from "express";
import { z } from "zod";
import { FoodListing } from "../models/FoodListing.js";
import { Order } from "../models/Order.js";
import { AuthRequest, allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();
router.post(
  "/",
  requireAuth,
  allowRoles("customer"),
  async (req: AuthRequest, res, next) => {
    try {
      const body = z
        .object({
          items: z
            .array(
              z.object({
                listingId: z.string(),
                quantity: z.number().int().positive(),
              }),
            )
            .min(1)
            .refine(
              (items) => new Set(items.map((item) => item.listingId)).size === items.length,
              { message: "Each listing may appear only once" },
            ),
        })
        .parse(req.body);
      const listings = await FoodListing.find({
        _id: { $in: body.items.map((item) => item.listingId) },
        status: "active",
        availableUntil: { $gt: new Date() },
      });
      if (listings.length !== body.items.length)
        return res
          .status(400)
          .json({ message: "One or more listings are unavailable" });
      const byId = new Map(listings.map((listing) => [listing.id, listing]));
      const first = listings[0];
      const unavailable = body.items.find(
        (item) => item.quantity > byId.get(item.listingId)!.quantity,
      );
      if (unavailable)
        return res.status(409).json({
          message: `${byId.get(unavailable.listingId)!.name} no longer has enough quantity`,
        });
      const items = body.items.map((item) => {
        const listing = byId.get(item.listingId)!;
        return {
          listing: listing._id,
          quantity: item.quantity,
          price: listing.surplusPrice,
        };
      });
      if (
        listings.some(
          (listing) => String(listing.business) !== String(first.business),
        )
      )
        return res
          .status(400)
          .json({ message: "Please place orders from one business at a time" });
      const reserved = [] as typeof items;
      let orderCreated = false;
      try {
        for (const item of items) {
          const listing = await FoodListing.findOneAndUpdate(
            {
              _id: item.listing,
              status: "active",
              availableUntil: { $gt: new Date() },
              quantity: { $gte: item.quantity },
            },
            [
              { $set: { quantity: { $subtract: ["$quantity", item.quantity] } } },
              {
                $set: {
                  status: {
                    $cond: [{ $eq: ["$quantity", 0] }, "sold_out", "$status"],
                  },
                },
              },
            ],
            { new: true },
          );
          if (!listing)
            return res.status(409).json({
              message: "A listing changed before your reservation. Refresh and try again.",
            });
          reserved.push(item);
        }
        const order = await Order.create({
          customer: req.user!.id,
          business: first.business,
          items,
          totalAmount: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          pickupTime: first.pickupTime,
        });
        orderCreated = true;
        res.status(201).json(order);
      } finally {
        if (!orderCreated) {
          await Promise.all(
            reserved.map((item) =>
              FoodListing.findByIdAndUpdate(item.listing, {
                $inc: { quantity: item.quantity },
                $set: { status: "active" },
              }),
            ),
          );
        }
      }
    } catch (error) {
      next(error);
    }
  },
);
router.get("/mine", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const filter =
      req.user!.role === "business"
        ? { business: req.user!.id }
        : { customer: req.user!.id };
    res.json(
      await Order.find(filter)
        .populate("items.listing")
        .sort({ createdAt: -1 }),
    );
  } catch (error) {
    next(error);
  }
});
router.patch(
  "/:id/status",
  requireAuth,
  allowRoles("business", "admin"),
  async (req: AuthRequest, res, next) => {
    try {
      const status = z
        .object({
          status: z.enum([
            "confirmed",
            "ready_for_pickup",
            "completed",
            "cancelled",
          ]),
        })
        .parse(req.body).status;
      const allowedPreviousStatuses = {
        confirmed: ["pending"],
        ready_for_pickup: ["confirmed"],
        completed: ["ready_for_pickup"],
        cancelled: ["pending", "confirmed", "ready_for_pickup"],
      } as const;
      const filter =
        req.user!.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, business: req.user!.id };
      const statusFilter =
        req.user!.role === "admin"
          ? status === "cancelled"
            ? { status: { $nin: ["completed", "cancelled"] } }
            : {}
          : { status: { $in: allowedPreviousStatuses[status] } };
      const order = await Order.findOneAndUpdate(
        { ...filter, ...statusFilter },
        { status },
        { new: true },
      );
      if (!order)
        return res.status(404).json({
          message: "Order not found or cannot be moved to that status",
        });
      if (status === "cancelled")
        await Promise.all(
          order.items.map((item) =>
            FoodListing.findByIdAndUpdate(item.listing, {
              $inc: { quantity: item.quantity },
              $set: { status: "active" },
            }),
          ),
        );
      res.json(order);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
