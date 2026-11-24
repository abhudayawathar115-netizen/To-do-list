import type {
  Task,
  TaskFilter,
  TaskFormValues,
  TaskPriority,
  TaskSort,
  TaskStats,
} from '../types/task';

export const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Engineering',
  'Design',
  'Finance',
  'Health',
] as const;

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function getTodayDateString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(
  task: Pick<Task, 'status' | 'due_date'>,
  todayStr: string = getTodayDateString()
): boolean {
  if (task.status === 'Completed' || !task.due_date) {
    return false;
  }
  return task.due_date < todayStr;
}

export function computeTaskStats(
  tasks: Task[],
  todayStr: string = getTodayDateString()
): TaskStats {
  const total = tasks.length;
  let pending = 0;
  let completed = 0;
  let overdue = 0;
  const byPriority: Record<TaskPriority, number> = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

  for (const task of tasks) {
    if (task.status === 'Completed') {
      completed += 1;
    } else {
      pending += 1;
      if (isTaskOverdue(task, todayStr)) {
        overdue += 1;
      }
    }
    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
  }

  const completionPercentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    pending,
    completed,
    overdue,
    completionPercentage,
    byPriority,
  };
}

export interface FilterSortOptions {
  search?: string;
  statusFilter?: TaskFilter;
  categoryFilter?: string;
  sortBy?: TaskSort;
}

export function filterAndSortTasks(
  tasks: Task[],
  options: FilterSortOptions,
  todayStr: string = getTodayDateString()
): Task[] {
  const search = (options.search ?? '').trim().toLowerCase();
  const statusFilter = options.statusFilter ?? 'All';
  const categoryFilter = options.categoryFilter ?? 'All';
  const sortBy = options.sortBy ?? 'created_desc';

  const filtered = tasks.filter((task) => {
    if (statusFilter === 'Pending' && task.status !== 'Pending') {
      return false;
    }
    if (statusFilter === 'Completed' && task.status !== 'Completed') {
      return false;
    }
    if (statusFilter === 'Overdue' && !isTaskOverdue(task, todayStr)) {
      return false;
    }

    if (
      categoryFilter !== 'All' &&
      task.category.toLowerCase() !== categoryFilter.toLowerCase()
    ) {
      return false;
    }

    if (search) {
      const titleMatch = task.title.toLowerCase().includes(search);
      const descMatch = task.description.toLowerCase().includes(search);
      const catMatch = task.category.toLowerCase().includes(search);
      if (!titleMatch && !descMatch && !catMatch) {
        return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'due_date_asc': {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const cmp = a.due_date.localeCompare(b.due_date);
        return cmp !== 0
          ? cmp
          : PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'due_date_desc': {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        const cmp = b.due_date.localeCompare(a.due_date);
        return cmp !== 0
          ? cmp
          : PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'priority_desc': {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      }
      case 'priority_asc': {
        const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        if (diff !== 0) return diff;
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      }
      case 'created_desc':
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TaskFormValues, string>>;
}

export function validateTaskInput(input: TaskFormValues): ValidationResult {
  const errors: Partial<Record<keyof TaskFormValues, string>> = {};
  const trimmedTitle = input.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Task title is required.';
  } else if (trimmedTitle.length > 200) {
    errors.title = 'Task title must be 200 characters or fewer.';
  }

  if (input.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) {
    errors.due_date = 'Due date must be a valid YYYY-MM-DD date.';
  }

  if (!['Low', 'Medium', 'High'].includes(input.priority)) {
    errors.priority = 'Please select a valid priority.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function extractCategories(tasks: Task[]): string[] {
  const set = new Set<string>(DEFAULT_CATEGORIES);
  for (const task of tasks) {
    const trimmed = task.category.trim();
    if (trimmed) {
      set.add(trimmed);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function formatDisplayDate(
  dateStr: string | null,
  todayStr: string = getTodayDateString()
): string {
  if (!dateStr) return 'No due date';
  if (dateStr === todayStr) return 'Today';

  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;

  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
