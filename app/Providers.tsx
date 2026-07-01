"use client";

import { Provider } from "react-redux";
import { store } from "../lib/redux/store";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/providers/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster position="top-right" richColors className="dark:hidden" />
        <Toaster position="top-right" richColors theme="dark" className="hidden dark:block" />
      </ThemeProvider>
    </Provider>
  );
}
