import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DashboardView } from './components/DashboardView';
import { EmptyState } from './components/EmptyState';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskFilters } from './components/TaskFilters';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskSkeleton } from './components/TaskSkeleton';
import { ToastContainer, type ToastItem } from './components/ToastContainer';
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskStatus,
  updateTask,
} from './services/taskService';
import type {
  NavView,
  Task,
  TaskFilter,
  TaskFormValues,
  TaskSort,
} from './types/task';
import {
  computeTaskStats,
  extractCategories,
  filterAndSortTasks,
} from './utils/taskLogic';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<TaskSort>('due_date_asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast]
  );

  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await fetchTasks();
      setTasks(loaded);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load tasks.';
      setLoadError(message);
      addToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadAllTasks();
  }, [loadAllTasks]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const categories = useMemo(() => extractCategories(tasks), [tasks]);

  const effectiveStatusFilter: TaskFilter =
    activeView === 'completed' ? 'Completed' : statusFilter;

  const visibleTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        search,
        statusFilter: effectiveStatusFilter,
        categoryFilter,
        sortBy,
      }),
    [tasks, search, effectiveStatusFilter, categoryFilter, sortBy]
  );

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setModalMode('edit');
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'edit' && editingTask) {
        const updated = await updateTask(editingTask.id, values);
        setTasks((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        addToast('success', `Updated "${updated.title}".`);
      } else {
        const created = await createTask(values);
        setTasks((prev) => [created, ...prev]);
        addToast('success', `Created "${created.title}".`);
      }
      setModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save task.';
      addToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    setTogglingTaskId(task.id);
    try {
      const updated = await toggleTaskStatus(task);
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      addToast(
        'success',
        updated.status === 'Completed'
          ? `Marked "${updated.title}" as completed.`
          : `Reopened "${updated.title}".`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update task status.';
      addToast('error', message);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      addToast('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to delete task.';
      addToast('error', message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
  };

  const handleNavigateToTasks = (filter: TaskFilter = 'All') => {
    setStatusFilter(filter);
    setActiveView(filter === 'Completed' ? 'completed' : 'tasks');
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    categoryFilter !== 'All' ||
    (activeView === 'tasks' && statusFilter !== 'All');

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (view === 'tasks' && statusFilter === 'Completed') {
            setStatusFilter('All');
          }
        }}
        onOpenNewTask={handleOpenCreateModal}
        stats={stats}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          activeView={activeView}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNewTask={handleOpenCreateModal}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {loadError && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{loadError}</span>
              </div>
              <button
                type="button"
                onClick={() => void loadAllTasks()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {activeView === 'dashboard' ? (
            <DashboardView
              tasks={tasks}
              stats={stats}
              isLoading={isLoading}
              togglingTaskId={togglingTaskId}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={setDeleteTarget}
              onNavigateToTasks={handleNavigateToTasks}
              onOpenNewTask={handleOpenCreateModal}
            />
          ) : (
            <div className="space-y-4">
              <TaskFilters
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                showStatusTabs={activeView === 'tasks'}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
                sortBy={sortBy}
                onSortChange={setSortBy}
                stats={stats}
              />

              <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                <span className="tabular-nums">
                  Showing{' '}
                  <strong className="font-semibold text-slate-700">
                    {visibleTasks.length}
                  </strong>{' '}
                  {visibleTasks.length === 1 ? 'task' : 'tasks'}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {isLoading ? (
                <TaskSkeleton count={4} />
              ) : visibleTasks.length === 0 ? (
                hasActiveFilters ? (
                  <EmptyState
                    title="No matching tasks"
                    description="No tasks match your current search or filter criteria. Try clearing your filters."
                    actionLabel="Clear Filters"
                    variant="reset"
                    onAction={handleResetFilters}
                  />
                ) : activeView === 'completed' ? (
                  <EmptyState
                    title="No completed tasks yet"
                    description="Tasks you mark as completed will appear here for reference."
                    actionLabel="View Pending Tasks"
                    variant="reset"
                    onAction={() => handleNavigateToTasks('Pending')}
                  />
                ) : (
                  <EmptyState
                    title="No tasks yet"
                    description="Get started by creating your first task with a due date and priority."
                    actionLabel="Add First Task"
                    onAction={handleOpenCreateModal}
                  />
                )
              ) : (
                <div className="space-y-3" data-testid="task-list">
                  {visibleTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isToggling={togglingTaskId === task.id}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleOpenEditModal}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <TaskFormModal
        isOpen={modalOpen}
        mode={modalMode}
        initialTask={editingTask}
        categories={categories}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setModalOpen(false);
            setEditingTask(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Task"
        taskTitle={deleteTarget?.title ?? ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
