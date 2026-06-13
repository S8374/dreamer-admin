import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery,
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    getDocuments: builder.query<
      any,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status && params.status !== "all") queryParams.append("status", params.status);

        return {
          url: `/admin/documents?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Documents"],
    }),
    getDocumentStats: builder.query<any, void>({
      query: () => ({
        url: `/admin/documents/stats`,
        method: "GET",
      }),
      providesTags: ["Documents"],
    }),
    updateVerificationStatus: builder.mutation<any, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/admin/documents/${userId}/verify`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Documents"],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentStatsQuery,
  useUpdateVerificationStatusMutation,
} = documentApi;
