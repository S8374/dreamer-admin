import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/otp/verify", // General Auth OTP verify endpoint
        method: "POST",
        body: data,
      }),
    }),
    adminLogout: builder.mutation<any, void>({
      query: () => ({
        url: "/admin/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useAdminLoginMutation, useVerifyOtpMutation, useAdminLogoutMutation } = authApi;
