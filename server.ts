import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  due_date: string | null;
  created_at: string;
}

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialTasks(): TaskRecord[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: 'Finalize Q4 product roadmap brief',
      description:
        'Align milestone dates across engineering and design before the leadership sync.',
      status: 'Pending',
      priority: 'High',
      category: 'Work',
      due_date: offsetDate(-2),
      created_at: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Audit database index performance',
      description:
        'Review query execution plans for filtered task lookups and add composite indexes if needed.',
      status: 'Pending',
      priority: 'High',
      category: 'Engineering',
      due_date: offsetDate(1),
      created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Refresh mobile navigation spacing tokens',
      description:
        'Ensure all touch targets meet the 44px minimum height across tablet and phone breakpoints.',
      status: 'Pending',
      priority: 'Medium',
      category: 'Design',
      due_date: offsetDate(3),
      created_at: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Reconcile monthly software subscriptions',
      description: 'Archive unused seats and verify invoice receipts for accounting.',
      status: 'Completed',
      priority: 'Low',
      category: 'Finance',
      due_date: offsetDate(-1),
      created_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Schedule annual dental checkup',
      description: 'Call clinic before noon to book an early morning slot next week.',
      status: 'Pending',
      priority: 'Low',
      category: 'Personal',
      due_date: offsetDate(6),
      created_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    },
  ];
}

function ensureStore(): TaskRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = createInitialTasks();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStore(tasks: TaskRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(tasks, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/tasks', (_req, res) => {
    const tasks = ensureStore().sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (title.length > 200) {
      return res
        .status(400)
        .json({ error: 'Task title must be 200 characters or fewer.' });
    }

    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    const priority =
      body.priority === 'High' || body.priority === 'Low' || body.priority === 'Medium'
        ? body.priority
        : 'Medium';
    const status = body.status === 'Completed' ? 'Completed' : 'Pending';
    const category =
      typeof body.category === 'string' && body.category.trim()
        ? body.category.trim().slice(0, 60)
        : 'General';

    let due_date: string | null = null;
    if (body.due_date !== null && body.due_date !== undefined && body.due_date !== '') {
      if (!isValidDateString(body.due_date)) {
        return res
          .status(400)
          .json({ error: 'Due date must be formatted as YYYY-MM-DD.' });
      }
      due_date = body.due_date;
    }

    const newTask: TaskRecord = {
      id: crypto.randomUUID(),
      title,
      description,
      status,
      priority,
      category,
      due_date,
      created_at: new Date().toISOString(),
    };

    const tasks = ensureStore();
    tasks.unshift(newTask);
    writeStore(tasks);

    return res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasks = ensureStore();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const existing = tasks[index];
    const body = req.body ?? {};

    let nextTitle = existing.title;
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return res.status(400).json({ error: 'Task title is required.' });
      }
      if (body.title.trim().length > 200) {
        return res
          .status(400)
          .json({ error: 'Task title must be 200 characters or fewer.' });
      }
      nextTitle = body.title.trim();
    }

    const nextDescription =
      typeof body.description === 'string'
        ? body.description.trim()
        : existing.description;

    const nextStatus =
      body.status === 'Completed' || body.status === 'Pending'
        ? body.status
        : existing.status;

    const nextPriority =
      body.priority === 'High' || body.priority === 'Medium' || body.priority === 'Low'
        ? body.priority
        : existing.priority;

    const nextCategory =
      typeof body.category === 'string'
        ? body.category.trim().slice(0, 60) || 'General'
        : existing.category;

    let nextDueDate = existing.due_date;
    if (body.due_date !== undefined) {
      if (body.due_date === null || body.due_date === '') {
        nextDueDate = null;
      } else if (isValidDateString(body.due_date)) {
        nextDueDate = body.due_date;
      } else {
        return res
          .status(400)
          .json({ error: 'Due date must be formatted as YYYY-MM-DD.' });
      }
    }

    const updated: TaskRecord = {
      ...existing,
      title: nextTitle,
      description: nextDescription,
      status: nextStatus,
      priority: nextPriority,
      category: nextCategory,
      due_date: nextDueDate,
    };

    tasks[index] = updated;
    writeStore(tasks);

    return res.json(updated);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasks = ensureStore();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    tasks.splice(index, 1);
    writeStore(tasks);
    return res.json({ deleted: true, id });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
