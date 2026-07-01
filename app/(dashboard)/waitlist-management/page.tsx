import { WaitlistTable } from "@/components/modules/WaitlistManagement/WaitlistTable";

export default function WaitlistManagementPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Waitlist Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View and manage users who have joined the waitlist.
          </p>
        </div>
      </div>
      
      <WaitlistTable />
    </div>
  );
}
