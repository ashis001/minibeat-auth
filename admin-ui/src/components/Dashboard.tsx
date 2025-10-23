import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { OrganizationSettings } from './OrganizationSettings';
import { LicenseStatus } from './LicenseStatus';
import { Users, Building2, Shield, LogOut, Menu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'organizations', label: 'Organizations', icon: Building2, adminOnly: true },
    { id: 'license', label: 'License Status', icon: Shield, adminOnly: false },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Auth Management</h1>
                <p className="text-sm text-slate-400">{user?.organization_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.full_name || user?.email}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6">
          <nav className="flex gap-2">
            {tabs.map((tab) => {
              if (tab.adminOnly && !isAdmin) return null;
              
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'users' && isAdmin && <UserManagement />}
        {activeTab === 'organizations' && isAdmin && <OrganizationSettings />}
        {activeTab === 'license' && <LicenseStatus />}
      </main>
    </div>
  );
};
