import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Task, TaskFormValues, TaskPriority, TaskStatus } from '../types/task';

function normalizeTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    status: (row.status === 'Completed' ? 'Completed' : 'Pending') as TaskStatus,
    priority: (
      row.priority === 'High' || row.priority === 'Low' ? row.priority : 'Medium'
    ) as TaskPriority,
    category: String(row.category ?? 'General') || 'General',
    due_date: row.due_date ? String(row.due_date).slice(0, 10) : null,
    created_at: row.created_at ? String(row.created_at) : new Date().toISOString(),
  };
}

async function handleApiResponse<T>(res: Response): Promise<T> {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof payload?.error === 'string' && payload.error
        ? payload.error
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchTasks(): Promise<Task[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to load tasks from Supabase.');
    }
    return (data ?? []).map((row) => normalizeTask(row as Record<string, unknown>));
  }

  const res = await fetch('/api/tasks');
  const data = await handleApiResponse<Record<string, unknown>[]>(res);
  return data.map(normalizeTask);
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status ?? 'Pending',
    priority: values.priority,
    category: values.category.trim() || 'General',
    due_date: values.due_date.trim() ? values.due_date.trim() : null,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create task in Supabase.');
    }
    return normalizeTask(data as Record<string, unknown>);
  }

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleApiResponse<Record<string, unknown>>(res);
  return normalizeTask(data);
}

export async function updateTask(
  id: string,
  updates: Partial<TaskFormValues> & { status?: TaskStatus }
): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.category !== undefined) {
    payload.category = updates.category.trim() || 'General';
  }
  if (updates.due_date !== undefined) {
    payload.due_date = updates.due_date.trim() ? updates.due_date.trim() : null;
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update task in Supabase.');
    }
    return normalizeTask(data as Record<string, unknown>);
  }

  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleApiResponse<Record<string, unknown>>(res);
  return normalizeTask(data);
}

export async function toggleTaskStatus(task: Task): Promise<Task> {
  const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
  return updateTask(task.id, { status: nextStatus });
}

export async function deleteTask(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      throw new Error(error.message || 'Failed to delete task from Supabase.');
    }
    return;
  }

  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await handleApiResponse<{ deleted: boolean }>(res);
}
