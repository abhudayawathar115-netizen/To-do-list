import { Search, X } from 'lucide-react';
import type { TaskFilter, TaskSort, TaskStats } from '../types/task';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskFilter;
  onStatusFilterChange: (filter: TaskFilter) => void;
  showStatusTabs?: boolean;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categories: string[];
  sortBy: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  stats: TaskStats;
}

const STATUS_TABS: TaskFilter[] = ['All', 'Pending', 'Completed', 'Overdue'];

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showStatusTabs = true,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  sortBy,
  onSortChange,
  stats,
}: TaskFiltersProps) {
  const getCountForTab = (tab: TaskFilter) => {
    switch (tab) {
      case 'All':
        return stats.total;
      case 'Pending':
        return stats.pending;
      case 'Completed':
        return stats.completed;
      case 'Overdue':
        return stats.overdue;
    }
  };

  return (
    <section
      aria-label="Search, filter, and sort tasks"
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label
              htmlFor="category-filter-select"
              className="text-xs font-medium text-slate-500 whitespace-nowrap"
            >
              Category
            </label>
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="h-10 w-full sm:w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <label
              htmlFor="sort-tasks-select"
              className="text-xs font-medium text-slate-500 whitespace-nowrap"
            >
              Sort by
            </label>
            <select
              id="sort-tasks-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as TaskSort)}
              className="h-10 w-full sm:w-44 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            >
              <option value="due_date_asc">Due Date (Earliest)</option>
              <option value="due_date_desc">Due Date (Latest)</option>
              <option value="priority_desc">Priority (High to Low)</option>
              <option value="priority_asc">Priority (Low to High)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {showStatusTabs && (
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 w-full sm:w-fit"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab;
            const count = getCountForTab(tab);
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onStatusFilterChange(tab)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    active ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
