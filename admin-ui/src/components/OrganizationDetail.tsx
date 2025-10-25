import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationApi, userApi } from '@/api/authClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Shield, Activity, Edit, Plus, Trash2, CheckCircle, XCircle, Clock, Building2, LogOut, Home as HomeIcon, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Organization {
  id: string;
  name: string;
  license_type: string;
  license_expires_at: string;
  max_users: number;
  features_enabled: string[];
  is_active: boolean;
  user_count: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  is_active: boolean;
  last_login: string | null;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user_email: string | null;
  status: string;
  ip_address: string | null;
}

export const OrganizationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', full_name: '', password: '', role: 'user' });

  useEffect(() => {
    fetchOrganization();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'activity') fetchAuditLogs();
  }, [id, activeTab]);

  const fetchOrganization = async () => {
    try {
      const orgs = await organizationApi.listOrganizations();
      const org = orgs.find((o: Organization) => o.id === id);
      setOrganization(org || null);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const allUsers = await userApi.listUsers();
      const orgUsers = allUsers.filter((u: User) => u.organization_id === id);
      setUsers(orgUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://139.59.22.121:8000/admin/audit/logs?organization_id=${id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const extendLicense = async (days: number) => {
    try {
      const currentExpiry = new Date(organization!.license_expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      
      await organizationApi.updateOrganization(id!, {
        license_expires_at: newExpiry.toISOString()
      });
      
      fetchOrganization();
      alert(`License extended by ${days} days`);
    } catch (error) {
      console.error('Failed to extend license:', error);
      alert('Failed to extend license');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userApi.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.createUser({
        ...newUser,
        organization_id: id
      });
      setShowAddUserModal(false);
      setNewUser({ email: '', full_name: '', password: '', role: 'user' });
      fetchUsers();
      alert('User created successfully');
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  if (loading || !organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const daysRemaining = Math.floor((new Date(organization.license_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 30;
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: HomeIcon, adminOnly: false },
    { id: 'organizations', label: 'Organizations', icon: Building2, adminOnly: true },
    { id: 'license', label: 'License', icon: Shield, adminOnly: false },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MiniBeast</h1>
              <p className="text-xs text-emerald-400">Auth Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-4 py-3 bg-slate-800 rounded-lg">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <p className="text-xs text-slate-500 text-center">© 2025 MiniBeast</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
            <p className="text-sm text-slate-400">Organization Details</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
          Edit Organization
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{organization.user_count} / {organization.max_users}</span>
          </div>
          <p className="text-slate-400">Active Users</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-lg font-semibold text-white capitalize">{organization.license_type}</span>
          </div>
          <p className="text-slate-400">License Type</p>
        </div>

        <div className={`bg-slate-800 rounded-lg p-6 border ${isExpiringSoon ? 'border-orange-500' : 'border-slate-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <Clock className={`w-8 h-8 ${isExpiringSoon ? 'text-orange-400' : 'text-slate-400'}`} />
            <span className={`text-2xl font-bold ${isExpiringSoon ? 'text-orange-400' : 'text-white'}`}>
              {daysRemaining} days
            </span>
          </div>
          <p className="text-slate-400">Until Expiry</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => extendLicense(30)}
              className="flex-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs transition-colors"
            >
              +30 Days
            </button>
            <button
              onClick={() => extendLicense(90)}
              className="flex-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-xs transition-colors"
            >
              +90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="flex border-b border-slate-700">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'license', label: 'License & Features', icon: Shield },
            { id: 'activity', label: 'Activity Log', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Organization Users</h3>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {users.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No users found</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.full_name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs capitalize">
                          {user.role}
                        </span>
                        {user.is_active ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-500" />
                        )}
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* License Tab */}
          {activeTab === 'license' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">License Type</p>
                    <p className="text-white font-semibold capitalize">{organization.license_type}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Expires At</p>
                    <p className="text-white font-semibold">{new Date(organization.license_expires_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Max Users</p>
                    <p className="text-white font-semibold">{organization.max_users}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <p className="text-white font-semibold">{organization.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
                <div className="flex flex-wrap gap-2">
                  {organization.features_enabled.map((feature) => (
                    <span key={feature} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm capitalize">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              {auditLogs.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No activity logs found</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-400">{log.user_email || 'System'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                        <span className={`text-xs ${log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({ email: '', full_name: '', password: '', role: 'user' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </main>
</div>
);
}; 
