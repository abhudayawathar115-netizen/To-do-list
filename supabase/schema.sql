-- Supabase SQL Schema for Taskflow To-Do List Application
-- Run this in the Supabase SQL Editor to create the tasks table and indexes.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  category TEXT NOT NULL DEFAULT 'General',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common filter and sort queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Public anon CRUD policy for workspace demo / single-tenant usage.
-- Note: For multi-user deployments with Supabase Auth, scope policies with auth.uid().
DROP POLICY IF EXISTS "Allow full access to tasks" ON public.tasks;
CREATE POLICY "Allow full access to tasks"
  ON public.tasks
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
