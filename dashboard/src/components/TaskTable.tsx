import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { TaskRecord } from '../types';
import { StatusBadge } from './StatusBadge';

interface ExtendedTaskRecord extends TaskRecord {
  id?: number;
  daily_revenue?: number | null;
}

interface TaskTableProps {
  data: ExtendedTaskRecord[];
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TaskTable({ data, canEdit, canDelete, onEdit, onDelete }: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'start' | 'weeks' | 'job'>('start');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const phases = useMemo(() => [...new Set(data.map((d) => d.sheet))], [data]);
  const statuses = useMemo(() => [...new Set(data.map((d) => d.status).filter(Boolean))], [data]);

  const filteredData = useMemo(() => {
    let result = data;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.job?.toLowerCase().includes(searchLower) ||
          t.crew?.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    if (phaseFilter !== 'all') {
      result = result.filter((t) => t.sheet === phaseFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sortBy) {
        case 'start':
          aVal = a.start || '';
          bVal = b.start || '';
          break;
        case 'weeks':
          aVal = a.weeks || 0;
          bVal = b.weeks || 0;
          break;
        case 'job':
          aVal = a.job || '';
          bVal = b.job || '';
          break;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, search, phaseFilter, statusFilter, sortBy, sortDir]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (column: 'start' | 'weeks' | 'job') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: 'start' | 'weeks' | 'job' }) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={{
        animationName: 'fadeIn',
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards',
        animationDelay: '700ms',
        opacity: 0,
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
          All Tasks
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 400, marginLeft: '12px' }}>
            ({filteredData.length} items)
          </span>
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search jobs, crews..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                width: '200px',
                outline: 'none',
              }}
            />
          </div>

          {/* Phase Filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select
              value={phaseFilter}
              onChange={(e) => { setPhaseFilter(e.target.value); setPage(0); }}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Phases</option>
              {phases.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s!}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th 
                onClick={() => handleSort('job')}
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: 'var(--text-muted)', 
                  fontWeight: 500, 
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Job <SortIcon column="job" />
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phase</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crew</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th 
                onClick={() => handleSort('weeks')}
                style={{ 
                  padding: '12px', 
                  textAlign: 'right', 
                  color: 'var(--text-muted)', 
                  fontWeight: 500, 
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  Weeks <SortIcon column="weeks" />
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Daily Rev</th>
              <th 
                onClick={() => handleSort('start')}
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  color: 'var(--text-muted)', 
                  fontWeight: 500, 
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Start Date <SortIcon column="start" />
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date</th>
              {(canEdit || canDelete) && (
                <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((task, idx) => (
              <tr 
                key={idx}
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.job || '—'}
                  </div>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{task.sheet}</td>
                <td style={{ padding: '12px', color: task.crew === 'Unassigned' ? 'var(--text-muted)' : 'var(--accent-cyan)', fontWeight: 500, fontSize: '0.875rem' }}>
                  {task.crew || '—'}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{task.description || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge status={task.status} />
                </td>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', textAlign: 'right' }}>
                  {task.weeks ? task.weeks.toFixed(1) : '—'}
                </td>
                <td style={{ padding: '12px', color: task.daily_revenue ? '#34d399' : 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', textAlign: 'right' }}>
                  {task.daily_revenue ? `$${task.daily_revenue.toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {formatDate(task.start)}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {formatDate(task.end)}
                </td>
                {(canEdit || canDelete) && (
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {canEdit && task.id && (
                        <button
                          onClick={() => onEdit?.(task.id!)}
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {canDelete && task.id && (
                        <button
                          onClick={() => onDelete?.(task.id!)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              background: page === 0 ? 'transparent' : 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 16px',
              color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              background: page >= totalPages - 1 ? 'transparent' : 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 16px',
              color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

