import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-500 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center px-16 w-full">
          {/* Center Branding */}
          <div className="text-center">
            <h1 className="text-7xl font-black text-slate-900 mb-4 tracking-tight">
              MiniBeast <span className="text-6xl">{'{Eagle}'}</span>
            </h1>
            <p className="text-xl text-slate-800 font-light italic tracking-wide">
              a product of <span className="font-semibold">Dataction</span>
            </p>
          </div>
        </div>

        {/* Bottom left watermark */}
        <div className="absolute bottom-8 left-8 text-slate-800/80">
          <p className="text-sm font-medium">© 2025 Dataction</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 relative">
        <div className="w-full max-w-md">
          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-600">Sign in to Auth Server</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Sign in to Auth Server
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Version watermark */}
          <div className="absolute bottom-8 right-8">
            <p className="text-xs text-slate-400 font-light">Version 2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
