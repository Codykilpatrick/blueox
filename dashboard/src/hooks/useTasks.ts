import { useState, useCallback } from 'react';
import { supabase, type Task } from '../lib/supabase';

export interface TaskInput {
  sheet: string;
  job: string;
  phase?: string;
  crew?: string;
  description?: string;
  status?: string;
  weeks?: number;
  start_date?: string;
  end_date?: string;
  daily_revenue?: number;
}

// Helper to clean task data - convert empty strings to null for database
function cleanTaskData(task: TaskInput): Record<string, unknown> {
  return {
    sheet: task.sheet || null,
    job: task.job,
    phase: task.phase?.trim() || null,
    crew: task.crew?.trim() || null,
    description: task.description?.trim() || null,
    status: task.status || 'S',
    weeks: task.weeks || null,
    start_date: task.start_date?.trim() || null,
    end_date: task.end_date?.trim() || null,
    daily_revenue: task.daily_revenue || null,
  };
}

// Interface for static JSON data format
interface StaticTaskRecord {
  sheet: string;
  job: string;
  phase?: string;
  crew?: string;
  description?: string;
  status?: string;
  weeks?: number;
  start?: string;
  end?: string;
  daily_revenue?: number;
}

// Convert static JSON format to Task format
function convertStaticToTask(record: StaticTaskRecord, index: number): Task {
  return {
    id: index + 1, // Generate a fake ID for display purposes
    sheet: record.sheet,
    job: record.job || null,
    phase: record.phase || null,
    crew: record.crew || null,
    description: record.description || null,
    status: record.status || null,
    weeks: record.weeks || null,
    start_date: record.start ? record.start.split('T')[0] : null,
    end_date: record.end ? record.end.split('T')[0] : null,
    daily_revenue: record.daily_revenue || null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function useTasks(isAuthenticated: boolean = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Fetch tasks from static JSON (for unauthenticated users / demo mode)
  const fetchStaticTasks = useCallback(async (): Promise<Task[]> => {
    try {
      const response = await fetch('/schedule_data.json');
      const data: StaticTaskRecord[] = await response.json();
      return data.map((record, index) => convertStaticToTask(record, index));
    } catch (err) {
      console.error('Error fetching static tasks:', err);
      return [];
    }
  }, []);

  // Fetch all tasks from Supabase (for authenticated users)
  const fetchSupabaseTasks = useCallback(async (): Promise<Task[] | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError.message);
        return null;
      }

      return data || [];
    } catch (err) {
      console.error('Exception fetching from Supabase:', err);
      return null;
    }
  }, []);

  // Fetch tasks based on authentication state
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isAuthenticated) {
      // Authenticated users: fetch from Supabase
      const supabaseTasks = await fetchSupabaseTasks();
      if (supabaseTasks !== null) {
        setTasks(supabaseTasks);
        setIsReadOnly(false);
      } else {
        // Fallback to static if Supabase fails
        const staticTasks = await fetchStaticTasks();
        setTasks(staticTasks);
        setIsReadOnly(true);
      }
    } else {
      // Unauthenticated users: always use static JSON (demo mode)
      const staticTasks = await fetchStaticTasks();
      setTasks(staticTasks);
      setIsReadOnly(true);
    }

    setLoading(false);
    setInitialized(true);
  }, [isAuthenticated, fetchStaticTasks, fetchSupabaseTasks]);

  // Add a new task (requires authentication)
  const addTask = async (task: TaskInput): Promise<boolean> => {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData.user) {
      setError('You must be logged in to add tasks');
      return false;
    }
    
    const cleanedData = cleanTaskData(task);

    const { error: insertError } = await supabase.from('tasks').insert({
      ...cleanedData,
      created_by: userData.user.id,
    });

    if (insertError) {
      console.error('Error adding task:', insertError);
      setError(insertError.message);
      return false;
    }

    await fetchTasks();
    return true;
  };

  // Update a task
  const updateTask = async (id: number, updates: Partial<TaskInput>): Promise<boolean> => {
    // Clean empty strings to null for database
    const cleanedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        cleanedUpdates[key] = value.trim() || null;
      } else {
        cleanedUpdates[key] = value ?? null;
      }
    }

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        ...cleanedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating task:', updateError);
      setError(updateError.message);
      return false;
    }

    await fetchTasks();
    return true;
  };

  // Delete a task
  const deleteTask = async (id: number): Promise<boolean> => {
    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      setError(deleteError.message);
      return false;
    }

    await fetchTasks();
    return true;
  };

  return {
    tasks,
    loading,
    error,
    initialized,
    isReadOnly,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}
