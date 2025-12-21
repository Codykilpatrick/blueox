import { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import type { Task } from '../lib/supabase';
import type { TaskInput } from '../hooks/useTasks';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskInput) => Promise<boolean>;
  task?: Task | null; // If provided, we're editing
  mode: 'add' | 'edit';
}

const SHEETS = ['Earthwork', 'Pipe', 'Roads', 'Concrete', 'Paving', 'Clearance', 'Punch Out'];
const STATUSES = [
  { code: 'S', label: 'Scheduled' },
  { code: 'A', label: 'Actual' },
  { code: 'D', label: 'Done' },
  { code: 'P', label: 'Potential' },
  { code: 'L', label: 'Late' },
  { code: 'E', label: 'Early' },
  { code: 'C', label: 'Clearance' },
];

export function JobModal({ isOpen, onClose, onSave, task, mode }: JobModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<TaskInput>({
    sheet: 'Earthwork',
    job: '',
    phase: '',
    crew: '',
    description: '',
    status: 'S',
    weeks: undefined,
    start_date: '',
    end_date: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        sheet: task.sheet || 'Earthwork',
        job: task.job || '',
        phase: task.phase || '',
        crew: task.crew || '',
        description: task.description || '',
        status: task.status || 'S',
        weeks: task.weeks || undefined,
        start_date: task.start_date ? task.start_date.split('T')[0] : '',
        end_date: task.end_date ? task.end_date.split('T')[0] : '',
      });
    } else {
      // Reset form for new task
      setFormData({
        sheet: 'Earthwork',
        job: '',
        phase: '',
        crew: '',
        description: '',
        status: 'S',
        weeks: undefined,
        start_date: '',
        end_date: '',
      });
    }
  }, [task, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.job.trim()) {
      setError('Job name is required');
      return;
    }

    setLoading(true);
    const success = await onSave(formData);
    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError('Failed to save. Please try again.');
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '6px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>
            {mode === 'add' ? 'Add New Job' : 'Edit Job'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Job Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Job Name *</label>
              <input
                type="text"
                value={formData.job}
                onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                placeholder="Enter job name"
                style={inputStyle}
              />
            </div>

            {/* Phase/Sheet */}
            <div>
              <label style={labelStyle}>Phase</label>
              <select
                value={formData.sheet}
                onChange={(e) => setFormData({ ...formData, sheet: e.target.value })}
                style={inputStyle}
              >
                {SHEETS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={inputStyle}
              >
                {STATUSES.map((s) => (
                  <option key={s.code} value={s.code}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Crew */}
            <div>
              <label style={labelStyle}>Crew</label>
              <input
                type="text"
                value={formData.crew}
                onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
                placeholder="Crew name"
                style={inputStyle}
              />
            </div>

            {/* Weeks */}
            <div>
              <label style={labelStyle}>Weeks</label>
              <input
                type="number"
                step="0.1"
                value={formData.weeks || ''}
                onChange={(e) => setFormData({ ...formData, weeks: parseFloat(e.target.value) || undefined })}
                placeholder="Duration in weeks"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                style={inputStyle}
              />
            </div>

            {/* Start Date */}
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* End Date */}
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <Loader size={18} className="spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

