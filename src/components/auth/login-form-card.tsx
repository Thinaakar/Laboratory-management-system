'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { saveSession, SUPER_ADMIN_DEMO, validateLogin } from '@/lib/auth/demo-users';
import { logAuditAction } from '@/lib/audit/log-action';

const REMEMBER_KEY = 'labcore-remember-email';

export function LoginFormCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
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

      setError(json.error ?? 'Invalid email or password. Please try again.');
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
      <div className="w-full max-w-[440px] animate-pulse rounded-2xl border border-slate-100 bg-white p-8 shadow-card-md">
        <div className="h-7 w-40 rounded bg-slate-100" />
        <div className="mt-2 h-4 w-full rounded bg-slate-100" />
        <div className="mt-8 space-y-4">
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-2xl border border-slate-100 bg-white px-8 pt-8 pb-5 shadow-xl hover:shadow-2xl hover:border-slate-200/50 transition-all duration-300">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
          <ShieldCheck size={13} className="text-slate-400" />
          Enterprise Portal
        </div>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome Back
        </h2>

        {error && (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-error font-medium"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-success font-medium"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="lims-input h-11 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@laboratory.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <Link
                href="/contact"
                className="text-xs font-bold text-primary transition-colors hover:text-primary-600"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="lims-input h-11 pr-11 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              Remember Me
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="lims-btn-primary h-11 w-full text-sm font-bold tracking-wide transition-all duration-150 hover:shadow-lg active:scale-[0.98] disabled:opacity-75"
              disabled={loading || !!success}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>

            <button
              type="button"
              onClick={fillSuperAdminDemo}
              className="inline-flex h-7 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
            >
              Super Admin Demo
            </button>
          </div>
        </form>
      </div>

      <p className="mt-4 text-center text-xs">
        <Link href="/" className="font-bold text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1">
          ← Back to primary marketing website
        </Link>
      </p>
    </div>
  );
}
