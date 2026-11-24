import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react';
import type { Task, TaskStats } from '../types/task';
import { filterAndSortTasks } from '../utils/taskLogic';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { TaskSkeleton } from './TaskSkeleton';

interface DashboardViewProps {
  tasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  togglingTaskId: string | null;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onNavigateToTasks: (filter?: 'All' | 'Pending' | 'Completed' | 'Overdue') => void;
  onOpenNewTask: () => void;
}

export function DashboardView({
  tasks,
  stats,
  isLoading,
  togglingTaskId,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onNavigateToTasks,
  onOpenNewTask,
}: DashboardViewProps) {
  const priorityQueue = filterAndSortTasks(tasks, {
    statusFilter: 'Pending',
    sortBy: 'due_date_asc',
  }).slice(0, 5);

  const kpiCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      caption: 'All workspace items',
      icon: ListTodo,
      accent: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
      filterTarget: 'All' as const,
    },
    {
      label: 'Pending Tasks',
      value: stats.pending,
      caption: 'Active in queue',
      icon: Clock,
      accent: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-700',
      filterTarget: 'Pending' as const,
    },
    {
      label: 'Completed Tasks',
      value: stats.completed,
      caption: 'Finished items',
      icon: CheckCircle2,
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-700',
      filterTarget: 'Completed' as const,
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdue,
      caption: 'Past due date',
      icon: AlertCircle,
      accent: stats.overdue > 0 ? 'text-red-700' : 'text-slate-900',
      iconBg:
        stats.overdue > 0
          ? 'bg-red-50 text-red-700'
          : 'bg-slate-100 text-slate-600',
      filterTarget: 'Overdue' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Task summary metrics">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onNavigateToTasks(card.filterTarget)}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 sm:p-5 text-left transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
                  <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                    {card.label}
                  </span>
                  <span
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums ${card.accent}`}
                  >
                    {card.value}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500">
                    {card.caption}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-label="Completion progress and priority breakdown"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Task Completion Progress
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 tabular-nums">
                {stats.completed} of {stats.total} tasks marked completed
              </p>
            </div>
            <span className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.completionPercentage}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Task completion percentage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.completionPercentage}
            className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 tabular-nums">
            <span>
              Remaining:{' '}
              <strong className="font-semibold text-slate-900">
                {stats.pending}
              </strong>
            </span>
            <span>
              Overdue:{' '}
              <strong
                className={`font-semibold ${
                  stats.overdue > 0 ? 'text-red-700' : 'text-slate-900'
                }`}
              >
                {stats.overdue}
              </strong>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">
            By Priority
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Distribution across all tasks
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="font-medium text-red-700">High Priority</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.byPriority.High}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <dt className="font-medium text-amber-700">Medium Priority</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.byPriority.Medium}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <dt className="font-medium text-slate-600">Low Priority</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.byPriority.Low}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-label="Upcoming and active tasks" className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Up Next
            </h2>
            <p className="text-sm text-slate-500">
              Pending tasks ordered by earliest due date
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTasks('All')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-200/60 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View all tasks</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <TaskSkeleton count={3} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create your first task to start tracking progress and deadlines."
            actionLabel="Add First Task"
            onAction={onOpenNewTask}
          />
        ) : priorityQueue.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="Every task in your workspace is marked completed. Add a new task or review completed items."
            actionLabel="Add New Task"
            onAction={onOpenNewTask}
          />
        ) : (
          <div className="space-y-3">
            {priorityQueue.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isToggling={togglingTaskId === task.id}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
