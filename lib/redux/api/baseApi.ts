import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.dremarr.com/api",
  credentials: "include",
  prepareHeaders: (headers) => {
    // We rely on HTTPOnly cookies for the JWT token as per backend configuration
    // But if we ever need explicit tokens, we can add them here
    headers.set("Content-Type", "application/json");
    return headers;
  },
});
