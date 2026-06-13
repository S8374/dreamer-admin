import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const promotionPackageApi = createApi({
  reducerPath: "promotionPackageApi",
  baseQuery,
  tagTypes: ["PromotionPackages", "PromotionPackageFeatures"],
  endpoints: (builder) => ({
    getPromotionPackages: builder.query<
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
          url: `/admin/promotion-packages?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["PromotionPackages"],
    }),
    getPromotionPackageById: builder.query<any, string>({
      query: (id) => ({
        url: `/admin/promotion-packages/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PromotionPackages", id }],
    }),
    createPromotionPackage: builder.mutation<any, any>({
      query: (body) => ({
        url: "/admin/promotion-packages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PromotionPackages"],
    }),
    updatePromotionPackage: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/promotion-packages/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PromotionPackages", id },
        "PromotionPackages",
      ],
    }),
    deletePromotionPackage: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/promotion-packages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PromotionPackages"],
    }),
    setPromotionPackageStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/promotion-packages/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PromotionPackages", id },
        "PromotionPackages",
      ],
    }),
    getPromotionPackageFeatures: builder.query<any, string>({
      query: (packageId) => ({
        url: `/admin/promotion-packages/${packageId}/features`,
        method: "GET",
      }),
      providesTags: (result, error, packageId) => [
        { type: "PromotionPackageFeatures", id: packageId },
      ],
    }),
    createPromotionPackageFeature: builder.mutation<any, { packageId: string; body: any }>({
      query: ({ packageId, body }) => ({
        url: `/admin/promotion-packages/${packageId}/features`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { packageId }) => [
        { type: "PromotionPackageFeatures", id: packageId },
      ],
    }),
    updatePromotionPackageFeature: builder.mutation<
      any,
      { packageId: string; featureId: string; body: any }
    >({
      query: ({ packageId, featureId, body }) => ({
        url: `/admin/promotion-packages/${packageId}/features/${featureId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { packageId }) => [
        { type: "PromotionPackageFeatures", id: packageId },
      ],
    }),
    deletePromotionPackageFeature: builder.mutation<any, { packageId: string; featureId: string }>({
      query: ({ packageId, featureId }) => ({
        url: `/admin/promotion-packages/${packageId}/features/${featureId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { packageId }) => [
        { type: "PromotionPackageFeatures", id: packageId },
      ],
    }),
  }),
});

export const {
  useGetPromotionPackagesQuery,
  useGetPromotionPackageByIdQuery,
  useCreatePromotionPackageMutation,
  useUpdatePromotionPackageMutation,
  useDeletePromotionPackageMutation,
  useSetPromotionPackageStatusMutation,
  useGetPromotionPackageFeaturesQuery,
  useCreatePromotionPackageFeatureMutation,
  useUpdatePromotionPackageFeatureMutation,
  useDeletePromotionPackageFeatureMutation,
} = promotionPackageApi;
