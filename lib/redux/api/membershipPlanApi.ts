import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const membershipPlanApi = createApi({
  reducerPath: "membershipPlanApi",
  baseQuery,
  tagTypes: ["MembershipPlans", "MembershipPlanFeatures", "Users"],
  endpoints: (builder) => ({
    getMembershipPlans: builder.query<
      any,
      { page?: number; limit?: number; includeInactive?: boolean }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.includeInactive !== undefined)
          queryParams.append("includeInactive", params.includeInactive.toString());

        return {
          url: `/admin/membership-plans?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["MembershipPlans"],
    }),
    getMembershipPlanById: builder.query<any, string>({
      query: (id) => ({
        url: `/admin/membership-plans/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "MembershipPlans", id }],
    }),
    createMembershipPlan: builder.mutation<any, any>({
      query: (body) => ({
        url: "/admin/membership-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MembershipPlans"],
    }),
    updateMembershipPlan: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/membership-plans/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MembershipPlans"],
    }),
    deleteMembershipPlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/membership-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MembershipPlans"],
    }),

    // Features
    getMembershipPlanFeatures: builder.query<any, string>({
      query: (membershipPlanId) => ({
        url: `/admin/membership-plans/${membershipPlanId}/features`,
        method: "GET",
      }),
      providesTags: ["MembershipPlanFeatures"],
    }),
    createMembershipPlanFeature: builder.mutation<
      any,
      { membershipPlanId: string; body: any }
    >({
      query: ({ membershipPlanId, body }) => ({
        url: `/admin/membership-plans/${membershipPlanId}/features`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MembershipPlanFeatures"],
    }),
    updateMembershipPlanFeature: builder.mutation<
      any,
      { membershipPlanId: string; featureId: string; body: any }
    >({
      query: ({ membershipPlanId, featureId, body }) => ({
        url: `/admin/membership-plans/${membershipPlanId}/features/${featureId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MembershipPlanFeatures"],
    }),
    deleteMembershipPlanFeature: builder.mutation<
      any,
      { membershipPlanId: string; featureId: string }
    >({
      query: ({ membershipPlanId, featureId }) => ({
        url: `/admin/membership-plans/${membershipPlanId}/features/${featureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MembershipPlanFeatures"],
    }),
    grantMembershipPlanAccess: builder.mutation<
      any,
      { membershipPlanId: string; userId: string; durationDays?: number; isYearly?: boolean }
    >({
      query: ({ membershipPlanId, ...body }) => ({
        url: `/admin/membership-plans/${membershipPlanId}/grant-access`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MembershipPlans", { type: "Users" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetMembershipPlansQuery,
  useGetMembershipPlanByIdQuery,
  useCreateMembershipPlanMutation,
  useUpdateMembershipPlanMutation,
  useDeleteMembershipPlanMutation,
  useGetMembershipPlanFeaturesQuery,
  useCreateMembershipPlanFeatureMutation,
  useUpdateMembershipPlanFeatureMutation,
  useDeleteMembershipPlanFeatureMutation,
  useGrantMembershipPlanAccessMutation,
} = membershipPlanApi;
