import { useState, useEffect, useMemo } from 'react';
import type { TaskRecord } from '../types';
import { STATUS_LABELS } from '../types';

export function useScheduleData() {
  const [data, setData] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/schedule_data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    if (!data.length) return null;

    const uniqueJobs = new Set(data.map((d) => d.job).filter(Boolean));
    const uniqueCrews = new Set(data.map((d) => d.crew).filter((c) => c && c !== 'Unassigned'));
    
    const statusCounts: Record<string, number> = {};
    const phaseCounts: Record<string, number> = {};
    const crewWorkload: Record<string, number> = {};
    const monthlyTasks: Record<string, number> = {};

    data.forEach((task) => {
      // Status counts
      const status = task.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Phase counts (use sheet as phase category)
      const phase = task.sheet;
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;

      // Crew workload (weeks)
      if (task.crew && task.crew !== 'Unassigned' && task.weeks) {
        crewWorkload[task.crew] = (crewWorkload[task.crew] || 0) + task.weeks;
      }

      // Monthly distribution
      if (task.start) {
        const month = task.start.slice(0, 7); // YYYY-MM
        monthlyTasks[month] = (monthlyTasks[month] || 0) + 1;
      }
    });

    // Calculate total weeks
    const totalWeeks = data.reduce((sum, t) => sum + (t.weeks || 0), 0);

    // Active vs scheduled
    const activeTasks = data.filter((t) => t.status === 'A').length;
    const scheduledTasks = data.filter((t) => t.status === 'S').length;
    const doneTasks = data.filter((t) => t.status === 'D').length;

    return {
      totalTasks: data.length,
      totalJobs: uniqueJobs.size,
      totalCrews: uniqueCrews.size,
      totalWeeks: Math.round(totalWeeks),
      activeTasks,
      scheduledTasks,
      doneTasks,
      statusCounts,
      phaseCounts,
      crewWorkload,
      monthlyTasks,
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!stats) return null;

    const phaseData = Object.entries(stats.phaseCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const statusData = Object.entries(stats.statusCounts).map(([code, value]) => ({
      name: STATUS_LABELS[code] || code,
      code,
      value,
    }));

    const crewData = Object.entries(stats.crewWorkload)
      .map(([name, weeks]) => ({
        name,
        weeks: Math.round(weeks * 10) / 10,
      }))
      .sort((a, b) => b.weeks - a.weeks)
      .slice(0, 10);

    const monthlyData = Object.entries(stats.monthlyTasks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count,
      }));

    return { phaseData, statusData, crewData, monthlyData };
  }, [stats]);

  return { data, loading, error, stats, chartData };
}

