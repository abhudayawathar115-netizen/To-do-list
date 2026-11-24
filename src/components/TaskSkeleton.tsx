export function TaskSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading tasks" role="status">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 animate-pulse"
        >
          <div className="mt-0.5 h-5 w-5 rounded-md bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3.5 w-1/2 rounded bg-slate-100" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 w-16 rounded bg-slate-100" />
              <div className="h-3 w-20 rounded bg-slate-100" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
