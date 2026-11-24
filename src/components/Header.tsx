import { Menu, Plus } from 'lucide-react';
import type { NavView } from '../types/task';

interface HeaderProps {
  activeView: NavView;
  onOpenMobileNav: () => void;
  onOpenNewTask: () => void;
}

const VIEW_TITLES: Record<NavView, string> = {
  dashboard: 'Dashboard',
  tasks: 'My Tasks',
  completed: 'Completed Tasks',
};

export function Header({
  activeView,
  onOpenMobileNav,
  onOpenNewTask,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400 font-medium whitespace-nowrap">
            Taskflow
          </span>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">
            /
          </span>
          <h1 className="font-display text-lg font-semibold text-slate-900 truncate">
            {VIEW_TITLES[activeView]}
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenNewTask}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors whitespace-nowrap shrink-0"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span>New Task</span>
      </button>
    </header>
  );
}
