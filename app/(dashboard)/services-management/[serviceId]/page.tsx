"use client";

import { use, useState } from "react";
import { SkillTable } from "@/components/modules/ServiceManagement/SkillTable";
import { useGetServiceByIdQuery } from "@/lib/redux/api/serviceApi";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SkillsPage({ params }: { params: Promise<{ serviceId: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15+ pattern)
  const resolvedParams = use(params);
  const serviceId = resolvedParams.serviceId;

  const { data: serviceData, isLoading } = useGetServiceByIdQuery(serviceId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link 
          href="/services-management" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-[#6b8f84] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          {isLoading ? (
            <span className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          ) : (
            <>{serviceData?.data?.name} - Skills</>
          )}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage predefined skill suggestions for this specific service.
        </p>
      </div>
      
      <SkillTable serviceId={serviceId} />
    </div>
  );
}
