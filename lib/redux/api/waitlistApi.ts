import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const waitlistApi = createApi({
  reducerPath: "waitlistApi",
  baseQuery,
  tagTypes: ["Waitlist"],
  endpoints: (builder) => ({
    getWaitlistEntries: builder.query<any, { page?: number; limit?: number; searchTerm?: string; status?: string }>({
      query: (params) => ({
        url: "/admin/waitlist",
        method: "GET",
        params,
      }),
      providesTags: ["Waitlist"],
    }),
  }),
});

export const { useGetWaitlistEntriesQuery } = waitlistApi;
