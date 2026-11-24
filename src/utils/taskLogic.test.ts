import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTaskStats,
  filterAndSortTasks,
  isTaskOverdue,
  validateTaskInput,
} from './taskLogic';
import type { Task } from '../types/task';

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Submit Q4 budget',
    description: 'Finalize spreadsheet and send to finance',
    status: 'Pending',
    priority: 'High',
    category: 'Finance',
    due_date: '2026-11-20',
    created_at: '2026-11-18T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Review API docs',
    description: 'Check REST endpoints for auth',
    status: 'Completed',
    priority: 'Medium',
    category: 'Engineering',
    due_date: '2026-11-19',
    created_at: '2026-11-19T09:00:00.000Z',
  },
  {
    id: '3',
    title: 'Design sprint retrospective',
    description: 'Prepare notes with team',
    status: 'Pending',
    priority: 'Low',
    category: 'Design',
    due_date: '2026-11-26',
    created_at: '2026-11-21T12:00:00.000Z',
  },
  {
    id: '4',
    title: 'Unscheduled backlog grooming',
    description: 'Triage incoming tickets',
    status: 'Pending',
    priority: 'Medium',
    category: 'Engineering',
    due_date: null,
    created_at: '2026-11-22T08:00:00.000Z',
  },
];

const TODAY = '2026-11-23';

test('isTaskOverdue detects pending past-due tasks and ignores completed or undated tasks', () => {
  assert.equal(isTaskOverdue(SAMPLE_TASKS[0], TODAY), true);
  assert.equal(isTaskOverdue(SAMPLE_TASKS[1], TODAY), false);
  assert.equal(isTaskOverdue(SAMPLE_TASKS[2], TODAY), false);
  assert.equal(isTaskOverdue(SAMPLE_TASKS[3], TODAY), false);
});

test('computeTaskStats computes totals, overdue count, and completion percentage', () => {
  const stats = computeTaskStats(SAMPLE_TASKS, TODAY);
  assert.equal(stats.total, 4);
  assert.equal(stats.pending, 3);
  assert.equal(stats.completed, 1);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.completionPercentage, 25);
  assert.equal(stats.byPriority.High, 1);
  assert.equal(stats.byPriority.Medium, 2);
  assert.equal(stats.byPriority.Low, 1);
});

test('computeTaskStats handles empty list safely', () => {
  const stats = computeTaskStats([], TODAY);
  assert.equal(stats.total, 0);
  assert.equal(stats.completionPercentage, 0);
});

test('filterAndSortTasks filters by status, search, and category', () => {
  const overdue = filterAndSortTasks(
    SAMPLE_TASKS,
    { statusFilter: 'Overdue' },
    TODAY
  );
  assert.deepEqual(
    overdue.map((t) => t.id),
    ['1']
  );

  const engPending = filterAndSortTasks(
    SAMPLE_TASKS,
    { statusFilter: 'Pending', categoryFilter: 'Engineering' },
    TODAY
  );
  assert.deepEqual(
    engPending.map((t) => t.id),
    ['4']
  );

  const searched = filterAndSortTasks(
    SAMPLE_TASKS,
    { search: 'budget' },
    TODAY
  );
  assert.deepEqual(
    searched.map((t) => t.id),
    ['1']
  );
});

test('filterAndSortTasks sorts by due date and priority correctly', () => {
  const byDueAsc = filterAndSortTasks(
    SAMPLE_TASKS,
    { sortBy: 'due_date_asc' },
    TODAY
  );
  assert.deepEqual(
    byDueAsc.map((t) => t.id),
    ['2', '1', '3', '4']
  );

  const byPriorityDesc = filterAndSortTasks(
    SAMPLE_TASKS,
    { sortBy: 'priority_desc' },
    TODAY
  );
  assert.deepEqual(
    byPriorityDesc.map((t) => t.id),
    ['1', '2', '4', '3']
  );
});

test('validateTaskInput requires non-empty title and valid fields', () => {
  const emptyTitle = validateTaskInput({
    title: '   ',
    description: 'Some note',
    due_date: '2026-11-30',
    priority: 'Medium',
    category: 'Work',
  });
  assert.equal(emptyTitle.valid, false);
  assert.ok(emptyTitle.errors.title);

  const validInput = validateTaskInput({
    title: 'Ship release notes',
    description: '',
    due_date: '2026-11-30',
    priority: 'High',
    category: 'Engineering',
  });
  assert.equal(validInput.valid, true);
  assert.deepEqual(validInput.errors, {});
});
