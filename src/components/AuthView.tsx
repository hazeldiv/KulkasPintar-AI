'use client';

import React, { useState } from 'react';
import { useToast } from './Toast';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(false);
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || 'Incorrect email or password');
        }

        showToast('Log in successful!', 'success');
        onLoginSuccess();
      } else {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const regData = await regRes.json();

        if (!regRes.ok) {
          throw new Error(regData.detail || 'Registration failed');
        }

        // Auto log in after register
        const logRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const logData = await logRes.json();

        if (!logRes.ok) {
          throw new Error(logData.detail || 'Login failed after registration');
        }

        showToast('Registration successful!', 'success');
        onLoginSuccess();
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-view" className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-[#FAF9F5] via-[#F4F3EE] to-[#EAE9E2] overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-teal-50 border border-teal-200/50 rounded-2xl mb-4 shadow-[0_0_30px_-5px_rgba(20,184,166,0.15)]">
          <img src="/logo.png" className="w-16 h-16 object-contain rounded-lg" alt="KulkasPintar AI Logo" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-teal-650 to-indigo-600">
          KulkasPintar AI
        </h2>
        <p className="mt-3 text-sm text-slate-550">
          Reduce food waste. Track inventory. Cook smarter.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-6 border border-slate-200/80 shadow-xl rounded-2xl sm:px-10">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 pb-3 text-center border-b-2 font-semibold transition cursor-pointer ${isLoginMode
                ? 'border-teal-650 text-teal-650'
                : 'border-transparent text-slate-550 hover:text-slate-800'
                }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 pb-3 text-center border-b-2 font-semibold transition cursor-pointer ${!isLoginMode
                ? 'border-teal-650 text-teal-650'
                : 'border-transparent text-slate-550 hover:text-slate-800'
                }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 bg-teal-600 hover:bg-teal-550 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoginMode ? 'Log In' : 'Register Profile'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
