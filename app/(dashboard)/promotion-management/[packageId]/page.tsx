"use client";

import { use } from "react";
import { PromotionPackageFeatureTable } from "@/components/modules/PromotionManagement/PromotionPackageFeatureTable";
import { useGetPromotionPackageByIdQuery } from "@/lib/redux/api/promotionPackageApi";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PromotionPackageFeaturesPage({ params }: { params: Promise<{ packageId: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15+ pattern)
  const resolvedParams = use(params);
  const packageId = resolvedParams.packageId;

  const { data: packageData, isLoading } = useGetPromotionPackageByIdQuery(packageId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link 
          href="/promotion-management" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-[#6b8f84] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Promotion Packages
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          {isLoading ? (
            <span className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          ) : (
            <>{packageData?.data?.name} - Features</>
          )}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage the specific features and entitlements included in this promotion package.
        </p>
      </div>
      
      <PromotionPackageFeatureTable promotionPackageId={packageId} />
    </div>
  );
}
