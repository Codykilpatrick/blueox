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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        setInitialized(true);
        return;
      }

      setTasks(data || []);
      setLoading(false);
      setInitialized(true);
    } catch (err) {
      console.error('Exception fetching tasks:', err);
      setError('Failed to fetch tasks');
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Add a new task
  const addTask = async (task: TaskInput): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    const cleanedData = cleanTaskData(task);
    
    const { error: insertError } = await supabase
      .from('tasks')
      .insert({
        ...cleanedData,
        created_by: userData.user?.id,
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
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

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
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}
