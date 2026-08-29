import { Router } from "express";
import { z } from "zod";

import { FoodListing } from "../models/FoodListing.js";
import { allowRoles, AuthRequest, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

const listingImageSchema = z
  .string()
  .trim()
  .max(1_500_000)
  .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Invalid image format");

const listingSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: listingImageSchema.optional(),
  category: z.string().trim().min(1),
  originalPrice: z.number().positive(),
  surplusPrice: z.number().positive(),
  quantity: z.number().int().min(0),
  pickupLocation: z.string().trim().min(1),
  pickupTime: z.string().trim().min(1),
  availableUntil: z.coerce.date(),
});

const listingUpdateSchema = listingSchema
  .partial()
  .extend({
    status: z.enum(["active", "sold_out", "expired", "cancelled", "draft"]).optional(),
  });

function getDiscountPercentage(originalPrice: number, surplusPrice: number) {
  if (!originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - surplusPrice) / originalPrice) * 100);
}

function serializeListing(listing: any) {
  return {
    ...listing,
    discountPercentage: getDiscountPercentage(
      listing.originalPrice,
      listing.surplusPrice,
    ),
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/listings
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res, next) => {
  try {
    const search = String(req.query.search ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const sort = String(req.query.sort ?? "newest");

    const minPrice =
      req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;

    const maxPrice =
      req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

    const filter: any = {
      status: "active",
      quantity: {
        $gt: 0,
      },
      availableUntil: {
        $gt: new Date(),
      },
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          businessName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined && !Number.isNaN(minPrice)) {
      filter.surplusPrice = {
        ...(filter.surplusPrice ?? {}),
        $gte: minPrice,
      };
    }

    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      filter.surplusPrice = {
        ...(filter.surplusPrice ?? {}),
        $lte: maxPrice,
      };
    }

    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (sort === "cheapest") {
      sortOption = {
        surplusPrice: 1,
      };
    }

    const listings = await FoodListing.find(filter).sort(sortOption).lean();

    let result = listings.map(serializeListing);

    if (sort === "discount") {
      result.sort((a, b) => b.discountPercentage - a.discountPercentage);
    }

    return res.json({
      success: true,
      listings: result,
      total: result.length,
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/listings/mine
|--------------------------------------------------------------------------
*/

router.get(
  "/mine",
  requireAuth,
  allowRoles("business"),
  async (req: AuthRequest, res, next) => {
    try {
      const listings = await FoodListing.find({
        business: req.user!.id,
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        listings: listings.map(serializeListing),
        total: listings.length,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET /api/listings/:id
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id).lean();

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (
      listing.status !== "active" ||
      listing.quantity <= 0 ||
      new Date(listing.availableUntil).getTime() <= Date.now()
    ) {
      return res.status(404).json({
        message: "Listing is no longer available",
      });
    }

    return res.json(serializeListing(listing));
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/listings
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requireAuth,
  allowRoles("business"),
  async (req: AuthRequest, res, next) => {
    try {
      const data = listingSchema.parse(req.body);
      const business = await User.findById(req.user!.id).select("name").lean();

      if (!business) {
        return res.status(404).json({ message: "Business account not found" });
      }

      if (data.surplusPrice >= data.originalPrice) {
        return res.status(400).json({
          message: "Surplus price must be lower than original price",
        });
      }

      if (data.availableUntil.getTime() <= Date.now()) {
        return res.status(400).json({
          message: "Availability time must be in the future",
        });
      }

      const listing = await FoodListing.create({
        ...data,
        business: req.user!.id,
        businessName: business.name,
        status: "active",
      });

      return res.status(201).json(serializeListing(listing.toObject()));
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| PATCH /api/listings/:id
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  requireAuth,
  allowRoles("business"),
  async (req: AuthRequest, res, next) => {
    try {
      const listing = await FoodListing.findOne({
        _id: req.params.id,
        business: req.user!.id,
      });

      if (!listing) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      const data = listingUpdateSchema.parse(req.body);

      const originalPrice = data.originalPrice ?? listing.originalPrice;

      const surplusPrice = data.surplusPrice ?? listing.surplusPrice;

      if (surplusPrice >= originalPrice) {
        return res.status(400).json({
          message: "Surplus price must be lower than original price",
        });
      }

      if (data.availableUntil && data.availableUntil.getTime() <= Date.now()) {
        return res.status(400).json({
          message: "Availability time must be in the future",
        });
      }

      Object.assign(listing, data);

      await listing.save();

      return res.json(serializeListing(listing.toObject()));
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| DELETE /api/listings/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  requireAuth,
  allowRoles("business"),
  async (req: AuthRequest, res, next) => {
    try {
      const listing = await FoodListing.findOneAndDelete({
        _id: req.params.id,
        business: req.user!.id,
      });

      if (!listing) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      return res.json({
        success: true,
        message: "Listing deleted",
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
