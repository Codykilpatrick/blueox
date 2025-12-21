import { useState } from 'react';
import { HardHat, Lock, User, AlertCircle } from 'lucide-react';

// Hardcoded credentials - change these!
const VALID_USERNAME = 'blueox';
const VALID_PASSWORD = 'schedule2025';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a slight delay for UX
    setTimeout(() => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        localStorage.setItem('blueox_auth', 'true');
        onLogin();
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      
      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                borderRadius: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(56, 189, 248, 0.3)',
              }}
            >
              <HardHat size={36} color="white" />
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-blue))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
              }}
            >
              Blue Ox Enterprises
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Sign in to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                }}
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label
                style={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading
                  ? 'var(--bg-tertiary)'
                  : 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(56, 189, 248, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(56, 189, 248, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(56, 189, 248, 0.3)';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            marginTop: '24px',
          }}
        >
          Blue Ox Enterprises, LLC • Schedule Management
        </p>
      </div>
    </div>
  );
}

