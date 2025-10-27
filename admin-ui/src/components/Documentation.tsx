import React, { useState } from 'react';
import { X, Shield, Users, Building2, Lock, Key, Activity, Clock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

interface DocumentationProps {
  onClose: () => void;
}

type Section = 'overview' | 'org-mgmt' | 'user-mgmt' | 'rbac' | 'security' | 'licenses' | 'architecture';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const menuItems = [
    { id: 'overview' as Section, label: 'Overview', icon: Sparkles },
    { id: 'org-mgmt' as Section, label: 'Organizations', icon: Building2 },
    { id: 'user-mgmt' as Section, label: 'User Management', icon: Users },
    { id: 'rbac' as Section, label: 'RBAC', icon: Shield },
    { id: 'security' as Section, label: 'Security', icon: Lock },
    { id: 'licenses' as Section, label: 'Licenses', icon: Key },
    { id: 'architecture' as Section, label: 'Architecture', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden border border-slate-700 animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-green/20 to-blue-600/20 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-blue-600 rounded-xl flex items-center justify-center animate-pulse">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">MiniBeast Admin Portal</h1>
              <p className="text-slate-300 text-sm">Authentication & Authorization System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-all duration-200 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content with Left Menu */}
        <div className="flex h-[calc(90vh-100px)]">
          {/* Left Sidebar Menu */}
          <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20 scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-102'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto animate-bounce" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Panel */}
          <main className="flex-1 overflow-y-auto p-8">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'org-mgmt' && <OrganizationSection />}
            {activeSection === 'user-mgmt' && <UserManagementSection />}
            {activeSection === 'rbac' && <RBACSection />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'licenses' && <LicensesSection />}
            {activeSection === 'architecture' && <ArchitectureSection />}
          </main>
        </div>
      </div>
    </div>
  );
};

// Overview Section
const OverviewSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-br from-brand-green/10 to-blue-600/10 rounded-xl p-6 border border-brand-green/30 animate-in fade-in duration-700">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-brand-green animate-spin-slow" />
        Welcome to MiniBeast Admin Portal
      </h2>
      <p className="text-slate-300 text-lg leading-relaxed">
        A comprehensive authentication and authorization system that provides centralized user management, 
        role-based access control (RBAC), and organization-level licensing for the MiniBeast platform.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Multi-Org', value: 'Support', color: 'from-green-500 to-emerald-600' },
        { label: 'JWT', value: 'Auth', color: 'from-blue-500 to-cyan-600' },
        { label: 'RBAC', value: 'Control', color: 'from-purple-500 to-pink-600' },
      ].map((stat, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-2 animate-in zoom-in`}
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="text-white font-bold text-3xl mb-1">{stat.label}</div>
          <div className="text-white/80 text-sm">{stat.value}</div>
        </div>
      ))}
    </div>

    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-in slide-in-from-left duration-700 delay-300">
      <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
      <div className="space-y-3">
        {[
          'Complete user lifecycle management',
          'Multi-tenant organization control',
          'Granular feature management',
          'Real-time license enforcement',
          'Comprehensive audit logging',
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg transform transition-all duration-300 hover:translate-x-2 hover:bg-slate-900 animate-in slide-in-from-bottom"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
            <span className="text-slate-300">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// User Management Section
const UserManagementSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-400 animate-bounce" />
        Enterprise User Management
      </h2>
      <p className="text-slate-300 text-lg">
        Complete user lifecycle management with granular permissions, self-service capabilities, and comprehensive audit trails.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {/* User Lifecycle */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-blue-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Users className="h-8 w-8 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">User Lifecycle Management</h3>
            <p className="text-slate-300 text-sm mb-4">
              End-to-end user provisioning with invitation workflows, email verification, and automated onboarding processes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">User Creation</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Email invitation system</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Email verification required</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Initial password setup</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>Welcome onboarding flow</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Profile Management</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Personal info updates</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Avatar/photo upload</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Notification preferences</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>2FA configuration</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Status Control</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Active/Suspended states</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Soft delete (archive)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Re-activation workflow</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>Permanent deletion</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Role & Permission Management */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-cyan-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Shield className="h-8 w-8 text-cyan-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Role & Permission Assignment</h3>
            <p className="text-slate-300 text-sm mb-4">
              Dynamic role assignment with inheritance, permission overrides, and real-time enforcement across all modules.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Role Assignment</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Developer (full access)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Ops (execute & monitor)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Tester (read-only)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">└─</span><span>Custom role creation</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Permission Control</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Module-level access</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Feature gate control</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>CRUD permissions</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">└─</span><span>API endpoint access</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Enforcement</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Real-time validation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>30-sec role check</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Auto-logout on change</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">└─</span><span>Session invalidation</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Audit */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-orange-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Activity className="h-8 w-8 text-orange-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Activity Tracking & Audit Logs</h3>
            <p className="text-slate-300 text-sm mb-4">
              Comprehensive audit trail with real-time monitoring, anomaly detection, and compliance-ready reporting.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Activity Logging</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Login/logout events</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Permission changes</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Module access tracking</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>API call logging</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Monitoring</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Failed login attempts</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Suspicious activity alerts</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Concurrent session detection</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>Geo-location tracking</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Compliance</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>90-day retention</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Exportable audit reports</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>GDPR compliance logs</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>SOC2 audit trails</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Organization Section
const OrganizationSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-purple-400 animate-pulse" />
        Enterprise Organization Management
      </h2>
      <p className="text-slate-300 text-lg">
        Multi-tenant architecture with isolated data, custom branding, and hierarchical permission inheritance.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {/* Organization Lifecycle */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-purple-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Building2 className="h-8 w-8 text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Organization Lifecycle Management</h3>
            <p className="text-slate-300 text-sm mb-4">
              Complete tenant isolation with dedicated resources, custom configurations, and independent data stores.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Creation & Setup</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Organization registration</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Custom domain mapping</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Branding configuration</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">└─</span><span>Initial admin setup</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Status Control</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Active/Paused states</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Suspension on non-payment</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Grace period handling</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">└─</span><span>Data archival options</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* License Management */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-pink-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Key className="h-8 w-8 text-pink-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">License & Feature Management</h3>
            <p className="text-slate-300 text-sm mb-4">
              Flexible licensing tiers with real-time enforcement, automatic expiry handling, and upgrade/downgrade workflows.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-400/30">
            <h4 className="text-sm font-bold text-white mb-2">License Tiers</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Trial (14 days, 5 users)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Professional (20 users)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Enterprise (unlimited)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">└─</span><span>Custom enterprise plans</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Module Control</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Validator access</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Migrator access</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Reconciliator access</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">└─</span><span>Dashboard analytics</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-pink-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Enforcement</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Real-time validation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Auto-block on expiry</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">├─</span><span>Feature gate checking</span></div>
              <div className="flex items-start gap-1.5"><span className="text-pink-400">└─</span><span>Usage metrics tracking</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Management */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-cyan-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Activity className="h-8 w-8 text-cyan-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Resource & Quota Management</h3>
            <p className="text-slate-300 text-sm mb-4">
              Enforce limits on users, API calls, and concurrent jobs to ensure fair resource allocation.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-sm font-bold text-white mb-2">User Limits</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Max users per org</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Concurrent sessions</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Invitation limits</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">└─</span><span>Auto-blocking on exceed</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
            <h4 className="text-sm font-bold text-white mb-2">API & Jobs</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>API rate limits</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Concurrent job limit</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">├─</span><span>Validation run quota</span></div>
              <div className="flex items-start gap-1.5"><span className="text-cyan-400">└─</span><span>Migration job limit</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// RBAC Section
const RBACSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-400 animate-spin-slow" />
        Role-Based Access Control
      </h2>
      <p className="text-slate-300 text-lg">
        Sophisticated permission system with three distinct roles.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {[
        {
          role: 'Developer',
          color: 'from-red-500 to-pink-600',
          permissions: [
            'Full access to all MiniBeast modules',
            'Configure AWS and Snowflake connections',
            'Deploy Validator, Migrator, Reconciliator',
            'Manage configurations and settings',
          ],
        },
        {
          role: 'Ops',
          color: 'from-blue-500 to-cyan-600',
          permissions: [
            'Execute validation and migration jobs',
            'View dashboards and reports',
            'Monitor module status',
            'Limited configuration access',
          ],
        },
        {
          role: 'Tester',
          color: 'from-green-500 to-emerald-600',
          permissions: [
            'View validation results',
            'Access test reports',
            'Read-only dashboard access',
            'No modification permissions',
          ],
        },
      ].map((item, i) => (
        <div
          key={i}
          className={`bg-gradient-to-r ${item.color} p-6 rounded-xl shadow-xl transform transition-all duration-500 hover:scale-105 animate-in zoom-in`}
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">{item.role} Role</h3>
          <div className="space-y-2">
            {item.permissions.map((perm, j) => (
              <div
                key={j}
                className="flex items-center gap-3 text-white/90 animate-in slide-in-from-left"
                style={{ animationDelay: `${(i * 200) + (j * 100)}ms` }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Security Section
const SecuritySection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Lock className="h-8 w-8 text-yellow-400 animate-bounce" />
        Industrial-Grade Security Architecture
      </h2>
      <p className="text-slate-300 text-lg">
        Bank-level security with military-grade encryption and multi-layered defense mechanisms.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {/* JWT Authentication */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-blue-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Key className="h-8 w-8 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">JWT Authentication - Industrial Standard</h3>
            <p className="text-slate-300 text-sm mb-4">
              RFC 7519 compliant JSON Web Tokens with asymmetric RSA-256 signature algorithm, ensuring tamper-proof authentication.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Token Structure</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Access token (15min TTL)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Refresh token (7 days)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Automatic rotation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>Secure HTTP-only cookies</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Payload Security</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Role-based claims</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Organization context</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Expiry timestamps</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>Signature verification</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Defense Mechanisms</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>XSS protection</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>CSRF token validation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">├─</span><span>Token blacklisting</span></div>
              <div className="flex items-start gap-1.5"><span className="text-blue-400">└─</span><span>IP binding (optional)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Security */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-green-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Lock className="h-8 w-8 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Password Security - Military-Grade Encryption</h3>
            <p className="text-slate-300 text-sm mb-4">
              Bcrypt with adaptive hashing (cost factor 12), making brute-force attacks computationally infeasible even with quantum computing.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-green-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Hashing Algorithm</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Bcrypt (Blowfish cipher)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>12 salt rounds (4096 iterations)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Random salt per password</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">└─</span><span>One-way hash (irreversible)</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-green-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Storage Protection</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Never stored in plaintext</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>PostgreSQL encrypted column</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>No logging of passwords</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">└─</span><span>Secure memory handling</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-green-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Policy Enforcement</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Min 8 chars required</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Complexity validation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">├─</span><span>Password history (5 prev)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-green-400">└─</span><span>90-day expiry option</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-purple-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Clock className="h-8 w-8 text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Session Management - Real-Time Monitoring</h3>
            <p className="text-slate-300 text-sm mb-4">
              Redis-backed session store with sub-millisecond response times and automatic invalidation on security events.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Session Store</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Redis in-memory cache</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Sub-ms read latency</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>AOF persistence enabled</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">└─</span><span>Cluster-ready setup</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Validation</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>30-sec role verification</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>License check per request</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>IP address validation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">└─</span><span>Device fingerprinting</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Auto-Termination</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Role change detection</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>License expiry trigger</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">├─</span><span>Inactivity timeout (30m)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-purple-400">└─</span><span>Manual revocation API</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Security */}
      <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-orange-500/50">
        <div className="flex items-start gap-4 mb-4">
          <Shield className="h-8 w-8 text-orange-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Network Security - Zero Trust Architecture</h3>
            <p className="text-slate-300 text-sm mb-4">
              Defense-in-depth strategy with TLS 1.3, IP whitelisting, and DDoS protection ensuring enterprise-grade security.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Encryption</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>TLS 1.3 (latest)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Perfect Forward Secrecy</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>HSTS enforced</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>Certificate pinning</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Access Control</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>IP whitelisting</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Geo-blocking options</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>Rate limiting (100 req/min)</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>API key authentication</span></div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/30">
            <h4 className="text-sm font-bold text-white mb-2">Threat Protection</h4>
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>DDoS mitigation</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>SQL injection prevention</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">├─</span><span>XSS filtering</span></div>
              <div className="flex items-start gap-1.5"><span className="text-orange-400">└─</span><span>CORS policy enforcement</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-700/50 animate-in fade-in duration-700 delay-500">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 animate-pulse" />
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Security Best Practices</h4>
          <ul className="space-y-2 text-yellow-200/80 text-sm">
            <li className="animate-in slide-in-from-left" style={{ animationDelay: '600ms' }}>• All passwords are hashed and never stored in plaintext</li>
            <li className="animate-in slide-in-from-left" style={{ animationDelay: '700ms' }}>• Token expiration enforced with automatic refresh</li>
            <li className="animate-in slide-in-from-left" style={{ animationDelay: '800ms' }}>• Role changes trigger immediate logout for security</li>
            <li className="animate-in slide-in-from-left" style={{ animationDelay: '900ms' }}>• License violations block access at login and runtime</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Licenses Section
const LicensesSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Key className="h-8 w-8 text-indigo-400 animate-pulse" />
        License Management
      </h2>
      <p className="text-slate-300 text-lg">
        Flexible licensing options to match your organization's needs.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-6">
      {[
        {
          name: 'Trial',
          duration: '30 Days',
          users: '10 users',
          features: ['All modules access', 'Basic support', 'Perfect for testing'],
          color: 'from-blue-500 to-cyan-600',
          badge: '🚀',
        },
        {
          name: 'Professional',
          duration: 'Annual',
          users: '50 users',
          features: ['All modules access', 'Priority support', 'Custom integrations', 'Advanced analytics'],
          color: 'from-brand-green to-emerald-600',
          badge: '⭐',
        },
        {
          name: 'Enterprise',
          duration: 'Custom',
          users: 'Unlimited',
          features: ['All modules access', '24/7 dedicated support', 'SLA guarantees', 'On-premise deployment', 'Custom features'],
          color: 'from-purple-500 to-pink-600',
          badge: '👑',
        },
      ].map((license, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br ${license.color} p-6 rounded-xl shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-2 animate-in zoom-in flex flex-col h-full`}
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 animate-bounce">{license.badge}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{license.name}</h3>
            <p className="text-white/80 text-sm">{license.duration}</p>
            <p className="text-white/60 text-xs mt-1">{license.users}</p>
          </div>
          <ul className="space-y-3 flex-1">
            {license.features.map((feature, j) => (
              <li
                key={j}
                className="flex items-center justify-center gap-2 text-white/90 text-sm animate-in slide-in-from-left"
                style={{ animationDelay: `${(i * 200) + (j * 100)}ms` }}
              >
                <span className="text-white font-bold">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-in fade-in duration-700 delay-500">
      <h3 className="text-xl font-bold text-white mb-4">License Features Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 py-3 px-4">Feature</th>
              <th className="text-center text-blue-400 py-3 px-4">Trial</th>
              <th className="text-center text-brand-green py-3 px-4">Professional</th>
              <th className="text-center text-purple-400 py-3 px-4">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'Users', trial: '10', pro: '50', ent: 'Unlimited' },
              { feature: 'Modules', trial: 'All', pro: 'All', ent: 'All + Custom' },
              { feature: 'Support', trial: 'Basic', pro: 'Priority', ent: '24/7 Dedicated' },
              { feature: 'SLA', trial: '-', pro: '-', ent: '✓' },
              { feature: 'On-Premise', trial: '-', pro: '-', ent: '✓' },
            ].map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors animate-in fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <td className="py-3 px-4 text-white font-medium">{row.feature}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.trial}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.pro}</td>
                <td className="py-3 px-4 text-center text-slate-300">{row.ent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Architecture Section with Animated Flow
const ArchitectureSection = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <Activity className="h-8 w-8 text-cyan-400 animate-pulse" />
          System Architecture
        </h2>
        <p className="text-slate-300 text-lg">
          Complete authentication and authorization flow connecting Admin Portal to MiniBeast Platform.
        </p>
      </div>

      {/* Architecture Diagram with Animated Flows */}
      <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700 overflow-hidden relative">

        <div className="grid grid-cols-12 gap-6 relative">
          {/* Left Side - Auth System Components */}
          <div className="col-span-5">
            <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-purple-500/50 h-full">
              <div className="border-b border-purple-500/30 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white text-center">Auth System Components</h3>
              </div>
              
              {/* Backend & Admin UI */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Backend (FastAPI)</h4>
                      <p className="text-[10px] text-purple-300">Port: 8000</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-400">├─</span>
                      <span>OAuth2 + JWT</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-400">├─</span>
                      <span>RBAC</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-400">├─</span>
                      <span>License Mgmt</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-400">└─</span>
                      <span>IP Whitelist</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-pink-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-pink-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Admin UI (React)</h4>
                      <p className="text-[10px] text-pink-300">Port: 5173</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-pink-400">├─</span>
                      <span>User Mgmt</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-pink-400">├─</span>
                      <span>Org Settings</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-pink-400">└─</span>
                      <span>License Dash</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Layer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">PostgreSQL</h4>
                      <p className="text-[10px] text-blue-300">Port: 5432</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-400">├─</span>
                      <span>Users</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-400">└─</span>
                      <span>Organizations</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-red-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-red-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Redis</h4>
                      <p className="text-[10px] text-red-300">Port: 6379</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-red-400">├─</span>
                      <span>Sessions</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-red-400">└─</span>
                      <span>Token Cache</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Simple Arrows */}
          <div className="col-span-2 flex flex-col items-center justify-center space-y-10 relative">
            {/* JWT Token Arrow */}
            <div className="flex flex-col items-center">
              <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <marker id="arrowhead-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
                  </marker>
                </defs>
                <line x1="5" y1="15" x2="95" y2="15" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-green)" />
              </svg>
              <span className="text-[10px] font-semibold text-brand-green mt-1">JWT Token</span>
            </div>

            {/* License Arrow */}
            <div className="flex flex-col items-center">
              <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <marker id="arrowhead-yellow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#fbbf24" />
                  </marker>
                </defs>
                <line x1="5" y1="15" x2="95" y2="15" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowhead-yellow)" />
              </svg>
              <span className="text-[10px] font-semibold text-yellow-400 mt-1">License</span>
            </div>

            {/* Permissions Arrow */}
            <div className="flex flex-col items-center">
              <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <marker id="arrowhead-cyan" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" />
                  </marker>
                </defs>
                <line x1="5" y1="15" x2="95" y2="15" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrowhead-cyan)" />
              </svg>
              <span className="text-[10px] font-semibold text-cyan-400 mt-1">Permissions</span>
            </div>
          </div>

          {/* Right Side - MiniBeast Platform */}
          <div className="col-span-5">
            <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-brand-green/50 h-full">
              <div className="border-b border-brand-green/30 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white text-center">MiniBeast Platform</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-green-400" />
                    <h4 className="text-xs font-bold text-white">Data Operations</h4>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-green-400">├─</span>
                      <span>Validator Module</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-green-400">├─</span>
                      <span>Migrator Module</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-green-400">├─</span>
                      <span>Reconciliator Module</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-green-400">└─</span>
                      <span>Dashboard & Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Flow - Authentication Journey */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="bg-slate-900/70 rounded-xl p-6 border-2 border-cyan-500/50">
            <div className="border-b border-cyan-500/30 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white text-center">Authentication Flow</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold text-white text-sm">1</div>
                  <h4 className="text-sm font-bold text-white">User Login</h4>
                </div>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400">├─</span>
                    <span>Enter credentials</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400">├─</span>
                    <span>Submit to portal</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-400">└─</span>
                    <span>HTTPS encrypted</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center font-bold text-white text-sm">2</div>
                  <h4 className="text-sm font-bold text-white">Validation</h4>
                </div>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-yellow-400">├─</span>
                    <span>Verify password</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-yellow-400">├─</span>
                    <span>Check RBAC role</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-yellow-400">└─</span>
                    <span>Validate license</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-green-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm">3</div>
                  <h4 className="text-sm font-bold text-white">JWT Issue</h4>
                </div>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-400">├─</span>
                    <span>Generate token</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-400">├─</span>
                    <span>Add permissions</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-400">└─</span>
                    <span>Store in Redis</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center font-bold text-white text-sm">4</div>
                  <h4 className="text-sm font-bold text-white">Access Grant</h4>
                </div>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-400">├─</span>
                    <span>Unlock modules</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-400">├─</span>
                    <span>Load dashboard</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-400">└─</span>
                    <span>Session active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Lock, title: 'Secure Auth', desc: 'JWT-based authentication with Redis session management', color: 'border-purple-500/30' },
          { icon: Shield, title: 'RBAC Control', desc: 'Role-based permissions enforced at every request', color: 'border-blue-500/30' },
          { icon: Key, title: 'License Check', desc: 'Real-time organization feature validation', color: 'border-brand-green/30' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`bg-slate-800/50 p-5 rounded-xl border ${item.color} transform transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Icon className="h-10 w-10 text-brand-green mb-3 animate-pulse" />
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
