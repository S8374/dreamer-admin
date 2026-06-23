import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const listingApi = createApi({
  reducerPath: "listingApi",
  baseQuery,
  tagTypes: ["Listings"],
  endpoints: (builder) => ({
    getListings: builder.query<
      any,
      { page: number; limit: number; search?: string; status?: string; sort?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status && params.status !== "all") queryParams.append("status", params.status);
        if (params.sort) queryParams.append("sort", params.sort);

        return {
          url: `/listings?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Listings"],
    }),
    getListingById: builder.query<any, string>({
      query: (id) => ({
        url: `/listings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Listings", id }],
    }),
    adminUpdateListing: builder.mutation<any, { listingId: string; body: any }>({
      query: ({ listingId, body }) => ({
        url: `/admin/users/listings/${listingId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { listingId }) => [
        "Listings",
        { type: "Listings", id: listingId },
      ],
    }),
    adminDeleteListing: builder.mutation<any, string>({
      query: (listingId) => ({
        url: `/admin/users/listings/${listingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Listings"],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useAdminUpdateListingMutation,
  useAdminDeleteListingMutation,
} = listingApi;
