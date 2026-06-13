import { PromotionPackageTable } from "@/components/modules/PromotionManagement/PromotionPackageTable";

export default function PromotionManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Promotion Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage promotion packages and their pricing.</p>
      </div>

      <PromotionPackageTable />
    </div>
  );
}
