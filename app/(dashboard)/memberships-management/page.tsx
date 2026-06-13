import { MembershipPlanTable } from "@/components/modules/MembershipManagement/MembershipPlanTable";

export default function MembershipsManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Membership Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage membership plans, features, and entitlements.</p>
      </div>

      <MembershipPlanTable />
    </div>
  );
}
