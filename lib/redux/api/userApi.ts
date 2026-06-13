import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<
      any,
      { page: number; limit: number; search?: string; role?: string; status?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.role && params.role !== "all") queryParams.append("role", params.role);
        if (params.status && params.status !== "all") queryParams.append("status", params.status);

        return {
          url: `/admin/users?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),
    getUserById: builder.query<any, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    getUserStats: builder.query<any, void>({
      query: () => ({
        url: "/admin/users/stats",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUserStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
    updateUserRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserStatsQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
