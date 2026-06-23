import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery,
  tagTypes: ["Support"],
  endpoints: (builder) => ({
    getTickets: builder.query<any, void>({
      query: () => ({
        url: "/support",
        method: "GET",
      }),
      providesTags: ["Support"],
    }),
    getTicketById: builder.query<any, string>({
      query: (id) => ({
        url: `/support/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Support", id }],
    }),
    updateTicketStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/support/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketByIdQuery, useUpdateTicketStatusMutation } = supportApi;
