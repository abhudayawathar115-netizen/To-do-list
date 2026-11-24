export type TaskStatus = 'Pending' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskFilter = 'All' | 'Pending' | 'Completed' | 'Overdue';

export type TaskSort =
  | 'due_date_asc'
  | 'due_date_desc'
  | 'priority_desc'
  | 'priority_asc'
  | 'created_desc';

export type NavView = 'dashboard' | 'tasks' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  due_date: string | null;
  created_at: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  category: string;
  status?: TaskStatus;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  completionPercentage: number;
  byPriority: Record<TaskPriority, number>;
}
