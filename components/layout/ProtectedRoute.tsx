"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetUserStatsQuery } from "@/lib/redux/api/userApi";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Using user stats as a quick validation endpoint. If this fails with 401,
  // the axios interceptor will handle the redirect.
  // We use skip if we are on the login page.
  const { isError, error, isLoading } = useGetUserStatsQuery(undefined, {
    skip: pathname === "/login",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  // If the query is loading, we can show a brief loading state or just render children
  // and let the interceptor kick in if it fails.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-[#6b8f84] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If there's a definitive 401 error, we ensure we redirect. (Interceptor also does this)
  if (isError && (error as any)?.status === 401) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
