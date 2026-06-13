"use client";

import { DocumentTable } from "@/components/modules/DocumentManagement/DocumentTable";
import { DocumentStats } from "@/components/modules/DocumentManagement/DocumentStats";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Document Verification</h1>
        <p className="text-zinc-500 mt-2">
          Review and verify user identity documents and professional certificates.
        </p>
      </div>

      <DocumentStats />
      
      <DocumentTable />
    </div>
  );
}
