import React, { useState, useEffect } from 'react';
import { Activity, Users, Building2, AlertCircle, CheckCircle, Server, Clock, Shield, XCircle } from 'lucide-react';
import axios from 'axios';

interface SystemStats {
  total_organizations: number;
  active_organizations: number;
  paused_organizations: number;
  total_users: number;
  active_users: number;
  expired_licenses: number;
  expiring_soon: number;
  failed_logins_today: number;
  ip_violations_today: number;
  api_health: {
    status: string;
    response_time: number;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export const Monitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://139.59.22.121:8000/admin/system/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Monitor</h2>
        <p className="text-slate-400">Real-time system health and activity monitoring</p>
      </div>

      {/* API Health Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              stats?.api_health.status === 'healthy' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              <Server className={`w-6 h-6 ${
                stats?.api_health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">API Status</h3>
              <p className="text-sm text-slate-400">Response Time: {stats?.api_health.response_time}ms</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            stats?.api_health.status === 'healthy' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {stats?.api_health.status === 'healthy' ? 'Operational' : 'Issues Detected'}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Organizations */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Organizations</p>
              <p className="text-2xl font-bold text-white">{stats?.total_organizations || 0}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Active:</span>
              <span className="text-emerald-400 font-medium">{stats?.active_organizations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Paused:</span>
              <span className="text-orange-400 font-medium">{stats?.paused_organizations || 0}</span>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Active:</span>
              <span className="text-emerald-400 font-medium">{stats?.active_users || 0}</span>
            </div>
          </div>
        </div>

        {/* License Status */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Licenses</p>
              <p className="text-2xl font-bold text-white">{stats?.expiring_soon || 0}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Expiring Soon:</span>
              <span className="text-orange-400 font-medium">{stats?.expiring_soon || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expired:</span>
              <span className="text-red-400 font-medium">{stats?.expired_licenses || 0}</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Security Today</p>
              <p className="text-2xl font-bold text-white">{(stats?.failed_logins_today || 0) + (stats?.ip_violations_today || 0)}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Failed Logins:</span>
              <span className="text-red-400 font-medium">{stats?.failed_logins_today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">IP Violations:</span>
              <span className="text-red-400 font-medium">{stats?.ip_violations_today || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity & Alerts</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                <div className={`mt-0.5 ${
                  activity.severity === 'error' ? 'text-red-400' :
                  activity.severity === 'warning' ? 'text-orange-400' :
                  'text-blue-400'
                }`}>
                  {activity.severity === 'error' ? <XCircle className="w-5 h-5" /> :
                   activity.severity === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                   <CheckCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
