import React, { useState } from 'react';
import { X, Shield, Users, Building2, Lock, Key, Activity, Database, Clock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

interface DocumentationProps {
  onClose: () => void;
}

type Section = 'overview' | 'user-mgmt' | 'org-mgmt' | 'rbac' | 'security' | 'licenses';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const menuItems = [
    { id: 'overview' as Section, label: 'Overview', icon: Sparkles },
    { id: 'user-mgmt' as Section, label: 'User Management', icon: Users },
    { id: 'org-mgmt' as Section, label: 'Organizations', icon: Building2 },
    { id: 'rbac' as Section, label: 'RBAC', icon: Shield },
    { id: 'security' as Section, label: 'Security', icon: Lock },
    { id: 'licenses' as Section, label: 'Licenses', icon: Key },
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
            {activeSection === 'user-mgmt' && <UserManagementSection />}
            {activeSection === 'org-mgmt' && <OrganizationSection />}
            {activeSection === 'rbac' && <RBACSection />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'licenses' && <LicensesSection />}
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
        User Management
      </h2>
      <p className="text-slate-300 text-lg">
        Complete control over user lifecycle with role assignments and permissions.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      {[
        {
          title: 'Create & Update',
          desc: 'Add new users and modify existing user details',
          icon: Users,
          color: 'text-green-400',
        },
        {
          title: 'Role Assignment',
          desc: 'Assign Admin, Manager, or Viewer roles',
          icon: Shield,
          color: 'text-blue-400',
        },
        {
          title: 'Password Management',
          desc: 'Secure password reset and recovery',
          icon: Lock,
          color: 'text-purple-400',
        },
        {
          title: 'Activity Tracking',
          desc: 'Monitor user actions and audit logs',
          icon: Activity,
          color: 'text-orange-400',
        },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-brand-green/10 animate-in zoom-in"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <Icon className={`h-12 w-12 ${item.color} mb-4 animate-pulse`} />
            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </div>
        );
      })}
    </div>
  </div>
);

// Organization Section
const OrganizationSection = () => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-purple-400 animate-pulse" />
        Organization Management
      </h2>
      <p className="text-slate-300 text-lg">
        Multi-tenant organization control with granular feature management.
      </p>
    </div>

    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-in fade-in duration-700">
      <h3 className="text-xl font-bold text-white mb-6">Organization Controls</h3>
      <div className="space-y-4">
        {[
          { label: 'Create Organizations', desc: 'Set up new organizations with custom settings', progress: 100 },
          { label: 'License Configuration', desc: 'Trial, Professional, or Enterprise licenses', progress: 85 },
          { label: 'Feature Control', desc: 'Enable/disable Validator, Migrator, Reconciliator', progress: 90 },
          { label: 'User Limits', desc: 'Enforce maximum user count per organization', progress: 75 },
          { label: 'Organization Status', desc: 'Pause or resume organization access', progress: 95 },
        ].map((item, i) => (
          <div
            key={i}
            className="transform transition-all duration-300 hover:translate-x-2 animate-in slide-in-from-left"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{item.label}</span>
              <span className="text-brand-green text-sm">{item.progress}%</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">{item.desc}</p>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-green to-blue-500 rounded-full transition-all duration-1000 animate-in"
                style={{ width: `${item.progress}%`, animationDelay: `${i * 100}ms` }}
              />
            </div>
          </div>
        ))}
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
          role: 'Admin',
          color: 'from-red-500 to-pink-600',
          permissions: [
            'Manage all users and organizations',
            'Configure licenses and features',
            'Access system monitoring',
            'View audit logs and activity',
          ],
        },
        {
          role: 'Manager',
          color: 'from-blue-500 to-cyan-600',
          permissions: [
            'Manage users in their organization',
            'Deploy and configure modules',
            'View organization dashboards',
            'Limited administrative capabilities',
          ],
        },
        {
          role: 'Viewer',
          color: 'from-green-500 to-emerald-600',
          permissions: [
            'View dashboards and metrics',
            'Access validation reports',
            'No modification permissions',
            'Read-only access',
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
        Security Architecture
      </h2>
      <p className="text-slate-300 text-lg">
        Enterprise-grade security with multiple layers of protection.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-6 border border-red-500/30 animate-in zoom-in">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-12 w-12 text-red-400 flex-shrink-0 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Critical Security Features</h3>
            <p className="text-slate-300">
              All security measures are enforced at multiple levels to ensure maximum protection of your data and user accounts.
            </p>
          </div>
        </div>
      </div>

      {[
        {
          title: 'JWT Authentication',
          items: ['Access & refresh tokens', 'Automatic token rotation', 'Secure token storage'],
          icon: Key,
          color: 'border-blue-500/30',
        },
        {
          title: 'Password Security',
          items: ['Bcrypt hashing', 'Salt rounds', 'Never stored in plaintext'],
          icon: Lock,
          color: 'border-green-500/30',
        },
        {
          title: 'Session Management',
          items: ['Redis-based storage', '30-second role verification', 'Automatic logout on role change'],
          icon: Clock,
          color: 'border-purple-500/30',
        },
        {
          title: 'License Enforcement',
          items: ['Real-time validation', 'Automatic blocking on expiry', 'Organization-level control'],
          icon: Shield,
          color: 'border-orange-500/30',
        },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className={`bg-slate-800/50 p-6 rounded-xl border ${item.color} transform transition-all duration-500 hover:scale-105 hover:shadow-xl animate-in slide-in-from-bottom`}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <Icon className="h-10 w-10 text-brand-green mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
            <ul className="space-y-2">
              {item.items.map((sub, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-slate-300 text-sm animate-in fade-in"
                  style={{ animationDelay: `${(i * 150) + (j * 100)}ms` }}
                >
                  <span className="text-brand-green mt-1">✓</span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
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
          className={`bg-gradient-to-br ${license.color} p-6 rounded-xl shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-2 animate-in zoom-in`}
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="text-center mb-4">
            <div className="text-5xl mb-2 animate-bounce">{license.badge}</div>
            <h3 className="text-2xl font-bold text-white mb-1">{license.name}</h3>
            <p className="text-white/80 text-sm">{license.duration}</p>
            <p className="text-white/60 text-xs mt-1">{license.users}</p>
          </div>
          <ul className="space-y-2">
            {license.features.map((feature, j) => (
              <li
                key={j}
                className="flex items-start gap-2 text-white/90 text-sm animate-in slide-in-from-left"
                style={{ animationDelay: `${(i * 200) + (j * 100)}ms` }}
              >
                <span className="text-white mt-0.5">✓</span>
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
