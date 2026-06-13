"use client";

import { ServiceTable } from "@/components/modules/ServiceManagement/ServiceTable";
import { ServiceStats } from "@/components/modules/ServiceManagement/ServiceStats";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Service Management</h1>
        <p className="text-zinc-500 mt-2">Manage your core services and their associated skills.</p>
      </div>

      <ServiceStats />
      
      <ServiceTable />
    </div>
  );
}
