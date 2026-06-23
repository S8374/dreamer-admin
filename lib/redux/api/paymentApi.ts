import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery,
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    getPayments: builder.query<
      any,
      { page: number; limit: number; search?: string; paymentType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.paymentType && params.paymentType !== "all") {
          queryParams.append("paymentType", params.paymentType);
        }

        return {
          url: `/admin/payments?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Payments"],
    }),
    getPaymentStats: builder.query<any, void>({
      query: () => ({
        url: "/admin/payments/stats",
        method: "GET",
      }),
      providesTags: ["Payments"],
    }),
  }),
});

export const { useGetPaymentsQuery, useGetPaymentStatsQuery } = paymentApi;
export default paymentApi;
