import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery,
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    getReports: builder.query<any, { status?: string; category?: string; search?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status && params.status !== "all") queryParams.append("status", params.status);
        if (params.category && params.category !== "all") queryParams.append("category", params.category);
        if (params.search) queryParams.append("search", params.search);

        return {
          url: `/reports?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Reports"],
    }),
    resolveReport: builder.mutation<any, { id: string; action: "action_taken" | "dismissed"; reviewNotes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/reports/${id}/resolve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reports"],
    }),
    getReportById: builder.query<any, string>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Reports", id }],
    }),
  }),
});

export const { useGetReportsQuery, useResolveReportMutation, useGetReportByIdQuery } = reportApi;
