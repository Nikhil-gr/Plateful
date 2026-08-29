import { api } from "@/lib/api";
import { FoodListing, ListingFilters, ListingsResponse } from "@/types/listing";


function buildQueryString(filters?: ListingFilters) {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function getListings(
  filters?: ListingFilters,
): Promise<ListingsResponse> {
  return api.get<ListingsResponse>(`/listings${buildQueryString(filters)}`);
}

export async function getListingById(id: string): Promise<FoodListing> {
  return api.get<FoodListing>(`/listings/${id}`);
}

export async function getMyListings(): Promise<ListingsResponse> {
  return api.get<ListingsResponse>("/listings/mine", {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("plateful_token") || undefined
        : undefined,
  });
}

export async function createListing(
  data: Partial<FoodListing>,
): Promise<FoodListing> {
  return api.post<FoodListing>("/listings", data, {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("plateful_token") || undefined
        : undefined,
  });
}

export async function updateListing({
  id,
  data,
}: {
  id: string;
  data: Partial<FoodListing>;
}): Promise<FoodListing> {
  return api.patch<FoodListing>(`/listings/${id}`, data, {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("plateful_token") || undefined
        : undefined,
  });
}

export async function deleteListing(id: string) {
  return api.delete(`/listings/${id}`, {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("plateful_token") || undefined
        : undefined,
  });
}
