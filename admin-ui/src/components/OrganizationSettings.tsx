import React, { useState, useEffect } from 'react';
import { organizationApi } from '@/api/authClient';
import { Plus, Edit, Calendar, Users } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  license_type: string;
  license_expires_at: string;
  max_users: number;
  features_enabled: string[];
  allowed_ips: string[];
  is_active: boolean;
  created_at: string;
  user_count: number;
}

export const OrganizationSettings: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    license_type: 'trial',
    license_expires_at: '',
    max_users: 5,
    features_enabled: ['validator'],
    allowed_ips: [] as string[],
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const data = await organizationApi.listOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await organizationApi.createOrganization(formData);
      setShowCreateModal(false);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create organization');
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    
    try {
      await organizationApi.updateOrganization(editingOrg.id, formData);
      setEditingOrg(null);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update organization');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      license_type: 'trial',
      license_expires_at: '',
      max_users: 5,
      features_enabled: ['validator'],
      allowed_ips: [],
    });
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      license_type: org.license_type,
      license_expires_at: org.license_expires_at.split('T')[0],
      max_users: org.max_users,
      features_enabled: org.features_enabled,
      allowed_ips: org.allowed_ips,
    });
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features_enabled: prev.features_enabled.includes(feature)
        ? prev.features_enabled.filter(f => f !== feature)
        : [...prev.features_enabled, feature]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Organizations</h2>
          <p className="text-slate-400 mt-1">Manage organizations and licenses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const daysRemaining = Math.ceil(
            (new Date(org.license_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isExpired = daysRemaining < 0;

          return (
            <div
              key={org.id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                    org.license_type === 'enterprise'
                      ? 'bg-purple-900/50 text-purple-300'
                      : org.license_type === 'standard'
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {org.license_type.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => openEditModal(org)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                {/* License Expiry */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>
                    {isExpired ? 'Expired' : `${daysRemaining} days left`}
                  </span>
                </div>

                {/* User Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">
                    {org.user_count} / {org.max_users} users
                  </span>
                </div>

                {/* Features */}
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {org.features_enabled.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-emerald-900/30 text-emerald-400 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    org.is_active
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {org.is_active ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingOrg) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingOrg ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <form onSubmit={editingOrg ? handleUpdateOrganization : handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    License Type *
                  </label>
                  <select
                    value={formData.license_type}
                    onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="trial">Trial</option>
                    <option value="standard">Standard</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Max Users *
                  </label>
                  <input
                    type="number"
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  License Expires *
                </label>
                <input
                  type="date"
                  value={formData.license_expires_at}
                  onChange={(e) => setFormData({ ...formData, license_expires_at: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enabled Features
                </label>
                <div className="space-y-2">
                  {['validator', 'migrator', 'reconciliator'].map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.features_enabled.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-600 rounded"
                      />
                      <span className="text-sm text-slate-300 capitalize">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Allowed IPs (comma-separated, leave empty for no restrictions)
                </label>
                <textarea
                  value={formData.allowed_ips.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allowed_ips: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  rows={3}
                  placeholder="192.168.1.1, 10.0.0.0/24"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOrg(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  {editingOrg ? 'Update' : 'Create'} Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
