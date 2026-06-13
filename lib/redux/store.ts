import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { serviceApi } from "./api/serviceApi";
import { documentApi } from "./api/documentApi";
import { membershipPlanApi } from "./api/membershipPlanApi";
import { promotionPackageApi } from "./api/promotionPackageApi";
import { translationApi } from "./api/translationApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [membershipPlanApi.reducerPath]: membershipPlanApi.reducer,
    [promotionPackageApi.reducerPath]: promotionPackageApi.reducer,
    [translationApi.reducerPath]: translationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      userApi.middleware, 
      serviceApi.middleware,
      documentApi.middleware,
      membershipPlanApi.middleware,
      promotionPackageApi.middleware,
      translationApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
