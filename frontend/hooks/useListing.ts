"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  getMyListings,
  updateListing,
} from "@/services/listingService";

import { listingKeys } from "@/queries/listingKeys";

import type { FoodListing, ListingFilters } from "@/types/listing";

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => getListings(filters),
  });
}

export function useListing(id?: string) {
  return useQuery({
    queryKey: listingKeys.detail(id || ""),
    queryFn: () => getListingById(id!),
    enabled: Boolean(id),
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: listingKeys.mine(),
    queryFn: getMyListings,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FoodListing>) => createListing(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateListing,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: listingKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },
  });
}
