import { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../axiosInstance";
import { AxiosRequestConfig, AxiosError } from "axios";

export const baseQuery: BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    body?: AxiosRequestConfig["data"]; // Added body to support fetchBaseQuery style
    params?: AxiosRequestConfig["params"];
    headers?: AxiosRequestConfig["headers"];
  },
  unknown,
  unknown
> = async ({ url, method, data, body, params, headers }) => {
  try {
    const result = await axiosInstance({
      url,
      method,
      data: data || body, // Map body to data
      params,
      headers,
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};
