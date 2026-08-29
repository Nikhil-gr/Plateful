export type ListingStatus =
  | "active"
  | "sold_out"
  | "expired"
  | "cancelled"
  | "draft";

export interface FoodListing {
  _id: string;
  business: string;
  businessName?: string;

  name: string;
  description: string;

  image?: string;

  category:
    | string
    | {
        _id: string;
        name: string;
      };

  originalPrice: number;
  surplusPrice: number;
  discountPercentage?: number;

  quantity: number;

  pickupLocation: string;
  pickupTime: string;
  availableUntil: string;

  status: ListingStatus;

  createdAt: string;
  updatedAt?: string;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ListingsResponse {
  success?: boolean;
  listings: FoodListing[];
  total?: number;
  page?: number;
  pages?: number;
}
