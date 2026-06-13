import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery,
  tagTypes: ["Services", "Skills"],
  endpoints: (builder) => ({
    getServices: builder.query<
      any,
      { page?: number; limit?: number; search?: string; includeInactive?: boolean }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.includeInactive !== undefined) queryParams.append("includeInactive", params.includeInactive.toString());

        return {
          url: `/admin/services?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Services"],
    }),
    getServiceStats: builder.query<any, void>({
      query: () => ({
        url: `/admin/services/stats`,
        method: "GET",
      }),
      providesTags: ["Services", "Skills"],
    }),
    getServiceById: builder.query<any, string>({
      query: (serviceId) => ({
        url: `/admin/services/${serviceId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Services", id }],
    }),
    createService: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: `/admin/services`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Services"],
    }),
    updateService: builder.mutation<any, { serviceId: string; body: Partial<any> }>({
      query: ({ serviceId, body }) => ({
        url: `/admin/services/${serviceId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { serviceId }) => [
        "Services",
        { type: "Services", id: serviceId },
      ],
    }),
    deleteService: builder.mutation<any, string>({
      query: (serviceId) => ({
        url: `/admin/services/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services"],
    }),

    // Skill Suggestions Endpoints
    getServiceSkills: builder.query<
      any,
      { serviceId: string; page?: number; limit?: number; search?: string; includeInactive?: boolean }
    >({
      query: ({ serviceId, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.includeInactive !== undefined) queryParams.append("includeInactive", params.includeInactive.toString());

        return {
          url: `/admin/services/${serviceId}/skills?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Skills"],
    }),
    createSkill: builder.mutation<any, { serviceId: string; body: Partial<any> }>({
      query: ({ serviceId, body }) => ({
        url: `/admin/services/${serviceId}/skills`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Skills"],
    }),
    updateSkill: builder.mutation<
      any,
      { serviceId: string; skillSuggestionId: string; body: Partial<any> }
    >({
      query: ({ serviceId, skillSuggestionId, body }) => ({
        url: `/admin/services/${serviceId}/skills/${skillSuggestionId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Skills"],
    }),
    deleteSkill: builder.mutation<any, { serviceId: string; skillSuggestionId: string }>({
      query: ({ serviceId, skillSuggestionId }) => ({
        url: `/admin/services/${serviceId}/skills/${skillSuggestionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Skills"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceStatsQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServiceSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = serviceApi;
