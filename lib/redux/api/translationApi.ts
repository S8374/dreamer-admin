import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const translationApi = createApi({
  reducerPath: "translationApi",
  baseQuery,
  endpoints: (builder) => ({
    translateText: builder.mutation<{ data: { translatedText: string } }, { text: string; targetLang?: string }>({
      query: (body) => ({
        url: "/admin/translation/translate",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useTranslateTextMutation } = translationApi;
