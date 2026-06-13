"use client";

import { Provider } from "react-redux";
import { store } from "../lib/redux/store";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors theme="light" />
    </Provider>
  );
}
