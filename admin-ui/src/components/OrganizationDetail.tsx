import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationApi, userApi } from '@/api/authClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Shield, Activity, Edit, Plus, Trash2, CheckCircle, XCircle, Clock, Building2, LogOut, Home as HomeIcon, Sparkles, Database } from 'lucide-react';
import axios from 'axios';

interface Organization {
  id: string;
  name: string;
  license_type: string;
  license_expires_at: string;
  max_users: number;
  features_enabled: string[];
  allowed_ips: string[];
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
  const [newUser, setNewUser] = useState({ email: '', full_name: '', password: '', role: 'developer' });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editOrgData, setEditOrgData] = useState({
    name: '',
    license_type: 'trial',
    license_expires_at: '',
    max_users: 5,
    features_enabled: [] as string[],
    allowed_ips: [] as string[]
  });

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

  const openEditOrgModal = () => {
    if (organization) {
      setEditOrgData({
        name: organization.name,
        license_type: organization.license_type,
        license_expires_at: organization.license_expires_at.split('T')[0],
        max_users: organization.max_users,
        features_enabled: organization.features_enabled,
        allowed_ips: organization.allowed_ips || []
      });
      setShowEditOrgModal(true);
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert date string to ISO datetime format
      const updateData = {
        ...editOrgData,
        license_expires_at: editOrgData.license_expires_at 
          ? new Date(editOrgData.license_expires_at + 'T23:59:59').toISOString()
          : editOrgData.license_expires_at
      };
      
      await organizationApi.updateOrganization(id!, updateData);
      setShowEditOrgModal(false);
      fetchOrganization();
      alert('Organization updated successfully');
    } catch (error: any) {
      console.error('Failed to update organization:', error);
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || JSON.stringify(error.response?.data || 'Failed to update organization');
      alert(errorMessage);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await userApi.updateUser(editingUser.id, {
        full_name: editingUser.full_name,
        is_active: editingUser.is_active,
        role: editingUser.role
      });
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers();
      alert('User updated successfully');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const toggleOrganizationStatus = async () => {
    try {
      await organizationApi.updateOrganization(id!, {
        is_active: !organization?.is_active
      });
      fetchOrganization();
      alert(`Organization ${!organization?.is_active ? 'resumed' : 'paused'} successfully`);
    } catch (error: any) {
      console.error('Failed to toggle organization status:', error);
      alert('Failed to update organization status');
    }
  };

  if (loading || !organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
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
    { id: 'database', label: 'Database', icon: Database, adminOnly: true },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-green to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MiniBeast Auth</h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            if (tab.adminOnly && !isAdmin) return null;
            
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => navigate('/dashboard', { state: { activeTab: tab.id } })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  tab.id === 'organizations'
                    ? 'bg-brand-green text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <p className="text-xs text-slate-500 text-center"> 2025 MiniBeast</p>
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
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOrganizationStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              organization.is_active
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {organization.is_active ? (
              <>
                <XCircle className="w-4 h-4" />
                Pause Organization
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Resume Organization
              </>
            )}
          </button>
          <button 
            onClick={openEditOrgModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Organization
          </button>
        </div>
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
            <Shield className="w-8 h-8 text-brand-green" />
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
                    ? 'border-brand-green text-brand-green'
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
                  className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green text-white rounded-lg transition-colors text-sm"
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
                          <CheckCircle className="w-5 h-5 text-brand-green" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-500" />
                        )}
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditUserModal(true);
                          }}
                          className="p-2 hover:bg-brand-green/20 text-brand-green rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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
                    <span key={feature} className="px-3 py-1 bg-brand-green/20 text-brand-green rounded-full text-sm capitalize">
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
                        <span className={`text-xs ${log.status === 'success' ? 'text-brand-green' : 'text-red-400'}`}>
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
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  required
                >
                  <option value="developer">Developer - Full Access</option>
                  <option value="tester">Tester - Validator, Dashboard, Reconciliator</option>
                  <option value="ops">Ops - Validator & Dashboard Only</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({ email: '', full_name: '', password: '', role: 'developer' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-green hover:bg-brand-green text-white rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Edit Organization</h2>
            <form onSubmit={handleEditOrganization} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={editOrgData.name}
                    onChange={(e) => setEditOrgData({ ...editOrgData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">License Type</label>
                  <select
                    value={editOrgData.license_type}
                    onChange={(e) => setEditOrgData({ ...editOrgData, license_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="trial">Trial</option>
                    <option value="standard">Standard</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">License Expires</label>
                  <input
                    type="date"
                    required
                    value={editOrgData.license_expires_at}
                    onChange={(e) => setEditOrgData({ ...editOrgData, license_expires_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Users</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editOrgData.max_users}
                    onChange={(e) => setEditOrgData({ ...editOrgData, max_users: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Features Enabled</label>
                <div className="grid grid-cols-2 gap-2">
                  {['validator', 'migrator', 'reconciliator'].map((feature) => (
                    <label key={feature} className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
                      <input
                        type="checkbox"
                        checked={editOrgData.features_enabled.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditOrgData({ ...editOrgData, features_enabled: [...editOrgData.features_enabled, feature] });
                          } else {
                            setEditOrgData({ ...editOrgData, features_enabled: editOrgData.features_enabled.filter(f => f !== feature) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300 capitalize">{feature.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Allowed IPs (comma-separated)</label>
                <textarea
                  value={editOrgData.allowed_ips.join(', ')}
                  onChange={(e) => setEditOrgData({ ...editOrgData, allowed_ips: e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip) })}
                  placeholder="192.168.1.1, 10.0.0.1"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditOrgModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-green hover:bg-brand-green text-white rounded-lg transition-colors"
                >
                  Update Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-brand-green"
                  required
                >
                  <option value="developer">Developer - Full Access</option>
                  <option value="tester">Tester - Validator, Dashboard, Reconciliator</option>
                  <option value="ops">Ops - Validator & Dashboard Only</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-green hover:bg-brand-green text-white rounded-lg transition-colors"
                >
                  Update User
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
