import type { ListingFilters } from "@/types/listing";

export const listingKeys = {
  all: ["listings"] as const,

  lists: () => [...listingKeys.all, "list"] as const,

  list: (filters?: ListingFilters) =>
    [...listingKeys.lists(), filters ?? {}] as const,

  details: () => [...listingKeys.all, "detail"] as const,

  detail: (id: string) => [...listingKeys.details(), id] as const,

  mine: () => [...listingKeys.all, "mine"] as const,
};
