'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { saveSession, SUPER_ADMIN_DEMO, validateLogin } from '@/lib/auth/demo-users';
import { logAuditAction } from '@/lib/audit/log-action';

const REMEMBER_KEY = 'labcore-remember-email';

export function LoginFormCard() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@labcore.io');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const completeSignIn = (user: { displayName: string; email: string; role: string }) => {
    saveSession({ name: user.displayName, email: user.email, role: user.role });
    logAuditAction({
      action: 'LOGIN',
      module: 'auth',
      details: `User signed in`,
      userId: user.email,
      userName: user.displayName,
    });
    setSuccess('Signed in successfully. Redirecting to your dashboard…');
    setTimeout(() => router.push('/dashboard'), 600);
  };

  const fillSuperAdminDemo = () => {
    setEmail(SUPER_ADMIN_DEMO.email);
    setPassword(SUPER_ADMIN_DEMO.password);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as {
        data?: { displayName: string; email: string; role: string; offline?: boolean };
        error?: string;
      };
      if (res.ok && json.data) {
        completeSignIn(json.data);
        return;
      }

      const demo = validateLogin(email, password);
      if (demo) {
        completeSignIn({ displayName: demo.name, email: demo.email, role: demo.role });
        return;
      }

      setError(json.error ?? 'Invalid work email or password. Please try again.');
    } catch {
      const demo = validateLogin(email, password);
      if (demo) {
        completeSignIn({ displayName: demo.name, email: demo.email, role: demo.role });
        return;
      }
      setError('Unable to connect. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-[420px] animate-pulse rounded-2xl border border-muted-border bg-white p-8 shadow-card-md">
        <div className="h-7 w-40 rounded bg-muted-bg" />
        <div className="mt-2 h-4 w-full rounded bg-muted-bg" />
        <div className="mt-8 space-y-4">
          <div className="h-11 rounded-lg bg-muted-bg" />
          <div className="h-11 rounded-lg bg-muted-bg" />
          <div className="h-11 rounded-lg bg-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-2xl border border-muted-border bg-white p-8 shadow-card-md transition-shadow hover:shadow-lg">
        <h2
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Welcome Back
        </h2>

        {error && (
          <div
            className="mt-6 rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mt-6 rounded-lg border border-success/30 bg-emerald-50 px-4 py-3 text-sm text-success"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              className="lims-input h-11 transition-shadow focus:shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@laboratory.com"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="lims-input h-11 pr-11 transition-shadow focus:shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-muted-border text-primary focus:ring-primary/30"
              />
              Remember Me
            </label>
            <Link
              href="/contact"
              className="font-medium text-primary transition-colors hover:text-primary-600"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="button"
            onClick={fillSuperAdminDemo}
            className="lims-btn-secondary h-11 w-full text-sm font-semibold uppercase tracking-wide"
          >
            Super Admin Demo
          </button>

          <button
            type="submit"
            className="lims-btn-primary h-11 w-full text-base transition-all hover:shadow-md disabled:opacity-70"
            disabled={loading || !!success}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Signing In…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/" className="text-primary transition-colors hover:underline">
          ← Back to website
        </Link>
      </p>
    </div>
  );
}
