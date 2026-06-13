export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Welcome to the Dreamer admin command center.
        </p>
      </div>

      {/* Placeholder Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 mb-4" />
            <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800 mb-2" />
            <div className="h-8 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
