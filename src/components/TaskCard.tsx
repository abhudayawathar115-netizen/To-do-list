import {
  AlertCircle,
  Calendar,
  Check,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Task } from '../types/task';
import { formatDisplayDate, isTaskOverdue } from '../utils/taskLogic';

interface TaskCardProps {
  task: Task;
  isToggling?: boolean;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  isToggling = false,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'Completed';
  const overdue = isTaskOverdue(task);

  const priorityTone =
    task.priority === 'High'
      ? 'text-red-700'
      : task.priority === 'Medium'
        ? 'text-amber-700'
        : 'text-slate-600';

  return (
    <article
      data-testid="task-card"
      className={`group flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-150 hover:border-slate-300 ${
        isCompleted ? 'bg-slate-50/70' : ''
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          disabled={isToggling}
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            isCompleted
              ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
          } disabled:opacity-50`}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold leading-snug break-words ${
              isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed line-clamp-2 ${
                isCompleted ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
            <span
              className={`inline-flex items-center gap-1 font-medium ${priorityTone}`}
            >
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{task.priority} Priority</span>
            </span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span className="font-medium text-slate-700">{task.category}</span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 tabular-nums ${
                overdue ? 'font-medium text-red-600' : 'text-slate-500'
              }`}
            >
              {overdue ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {overdue
                  ? `Overdue (${formatDisplayDate(task.due_date)})`
                  : formatDisplayDate(task.due_date)}
              </span>
            </span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span
              className={
                isCompleted
                  ? 'font-medium text-emerald-700'
                  : 'font-medium text-slate-600'
              }
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-transparent px-3 text-xs font-medium text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors whitespace-nowrap shrink-0"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-transparent px-3 text-xs font-medium text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors whitespace-nowrap shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}
