import React, { useState, useEffect } from 'react';
import { Users, Building2, Shield, TrendingUp, Clock, AlertTriangle, Activity } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  total_users: number;
  total_organizations: number;
  active_licenses: number;
  expiring_soon: number;
  new_users_week: number;
  active_users_month: number;
  license_distribution: Record<string, number>;
  user_roles: Record<string, number>;
  recent_users: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;
  recent_organizations: Array<{
    id: string;
    name: string;
    license_type: string;
    created_at: string;
  }>;
}

export const Home: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://139.59.22.121:8000/admin/stats/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-slate-400 py-8">
        Failed to load dashboard statistics
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500/20 text-blue-400',
      trend: `+${stats.new_users_week} this week`
    },
    {
      title: 'Organizations',
      value: stats.total_organizations,
      icon: Building2,
      color: 'bg-purple-500/20 text-purple-400',
      trend: 'Active'
    },
    {
      title: 'Active Licenses',
      value: stats.active_licenses,
      icon: Shield,
      color: 'bg-emerald-500/20 text-emerald-400',
      trend: `${stats.expiring_soon} expiring soon`
    },
    {
      title: 'Monthly Active Users',
      value: stats.active_users_month,
      icon: Activity,
      color: 'bg-orange-500/20 text-orange-400',
      trend: 'Last 30 days'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
              <p className="text-slate-400 text-sm mb-2">{card.title}</p>
              <p className="text-xs text-slate-500">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Distribution */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            License Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.license_distribution).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 capitalize">{type}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / stats.total_organizations) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Users by Role
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.user_roles).map(([role, count]) => (
              <div key={role}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300 capitalize">{role}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(count / stats.total_users) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {stats.recent_users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded capitalize">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Recent Organizations
          </h3>
          <div className="space-y-3">
            {stats.recent_organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{org.name}</p>
                    <p className="text-xs text-slate-400">{new Date(org.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded capitalize">
                  {org.license_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.expiring_soon > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm font-semibold text-orange-400">Licenses Expiring Soon</p>
              <p className="text-xs text-orange-300/80">
                {stats.expiring_soon} organization{stats.expiring_soon > 1 ? 's' : ''} have licenses expiring within 30 days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
