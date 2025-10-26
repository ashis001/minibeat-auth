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
    message?: string;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

interface ApiEndpoint {
  name: string;
  endpoint: string;
  status: 'healthy' | 'slow' | 'failed';
  response_time: number;
  message: string;
}

interface ApiHealthDetails {
  overall_status: string;
  overall_message: string;
  total_endpoints: number;
  healthy_count: number;
  slow_count: number;
  failed_count: number;
  endpoints: ApiEndpoint[];
}

interface FailedLoginLog {
  id: string;
  timestamp: string;
  user_email: string;
  ip_address: string;
  organization_id: string | null;
  status: string;
  details: {
    reason: string;
    email: string;
    organization?: string;
  };
  error_message: string;
}

export const Monitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiDetails, setApiDetails] = useState<ApiHealthDetails | null>(null);
  const [loadingApiDetails, setLoadingApiDetails] = useState(false);
  const [showFailedLoginsModal, setShowFailedLoginsModal] = useState(false);
  const [failedLogins, setFailedLogins] = useState<FailedLoginLog[]>([]);
  const [loadingFailedLogins, setLoadingFailedLogins] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FailedLoginLog | null>(null);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://139.59.22.121:8000/admin/system/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data);

      // Generate recent activity based on stats
      const activities: RecentActivity[] = [];

      if (response.data.paused_organizations > 0) {
        activities.push({
          type: 'organization',
          message: `${response.data.paused_organizations} organization(s) paused`,
          timestamp: new Date().toLocaleString(),
          severity: 'warning'
        });
      }

      if (response.data.expiring_soon > 0) {
        activities.push({
          type: 'license',
          message: `${response.data.expiring_soon} license(s) expiring soon`,
          timestamp: new Date().toLocaleString(),
          severity: 'warning'
        });
      }

      if (response.data.failed_logins_today > 0) {
        activities.push({
          type: 'security',
          message: `${response.data.failed_logins_today} failed login attempts today`,
          timestamp: new Date().toLocaleString(),
          severity: 'error'
        });
      }

      if (activities.length === 0) {
        activities.push({
          type: 'system',
          message: 'All systems operational',
          timestamp: new Date().toLocaleString(),
          severity: 'info'
        });
      }

      setRecentActivity(activities);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch system stats:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to load system stats');
      setRecentActivity([{
        type: 'error',
        message: 'Failed to load system stats',
        timestamp: new Date().toLocaleString(),
        severity: 'error'
      }]);
      setLoading(false);
    }
  };

  const fetchApiDetails = async () => {
    try {
      setLoadingApiDetails(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://139.59.22.121:8000/admin/system/api-health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApiDetails(response.data);
      setShowApiModal(true);
      setLoadingApiDetails(false);
    } catch (error: any) {
      console.error('Failed to fetch API details:', error);
      setLoadingApiDetails(false);
    }
  };

  const fetchFailedLogins = async () => {
    try {
      setLoadingFailedLogins(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://139.59.22.121:8000/admin/audit/logs?action=login_failed&days=7&limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFailedLogins(response.data);
      setShowFailedLoginsModal(true);
      setLoadingFailedLogins(false);
    } catch (error: any) {
      console.error('Failed to fetch failed logins:', error);
      setLoadingFailedLogins(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load System Stats</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
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
              {stats?.api_health.message && (
                <p className="text-xs text-slate-500 mt-1">{stats.api_health.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchApiDetails}
              disabled={loadingApiDetails}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loadingApiDetails ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              View Details
            </button>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              stats?.api_health.status === 'healthy' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stats?.api_health.status === 'healthy' ? 'Operational' : 'Issues Detected'}
            </div>
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
          {(stats?.failed_logins_today || 0) > 0 && (
            <button
              onClick={fetchFailedLogins}
              disabled={loadingFailedLogins}
              className="mt-4 w-full px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
            >
              {loadingFailedLogins ? 'Loading...' : 'View Details'}
            </button>
          )}
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

      {/* Failed Logins Details Modal */}
      {showFailedLoginsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-5xl border-2 border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Failed Login Attempts</h2>
                <p className="text-sm text-slate-400">Last 7 days - {failedLogins.length} attempts</p>
              </div>
              <button
                onClick={() => {
                  setShowFailedLoginsModal(false);
                  setSelectedLog(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Failed Logins List */}
            <div className="p-6">
              {failedLogins.length > 0 ? (
                <div className="space-y-3">
                  {failedLogins.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-red-500/5 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{log.user_email || 'Unknown User'}</h4>
                              <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                            <div>
                              <p className="text-slate-400 text-xs">IP Address</p>
                              <p className="text-white font-mono">{log.ip_address || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Reason</p>
                              <p className="text-red-400 font-medium">{log.error_message}</p>
                            </div>
                            {log.details?.organization && (
                              <div>
                                <p className="text-slate-400 text-xs">Organization</p>
                                <p className="text-white">{log.details.organization}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-slate-400 text-xs">Failure Type</p>
                              <p className="text-orange-400">{log.details?.reason?.replace('_', ' ').toUpperCase()}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No failed login attempts in the last 7 days</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex justify-end">
              <button
                onClick={() => {
                  setShowFailedLoginsModal(false);
                  setSelectedLog(null);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl border-2 border-red-500/30 shadow-2xl">
            <div className="bg-red-500/10 border-b border-red-500/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Login Attempt Details</h3>
                    <p className="text-sm text-red-400">Security Incident Report</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Email / Username</p>
                  <p className="text-white font-medium">{selectedLog.user_email}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">IP Address</p>
                  <p className="text-white font-mono">{selectedLog.ip_address || 'Not captured'}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                  <p className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <p className="text-red-400 font-medium">{selectedLog.status.toUpperCase()}</p>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <p className="text-xs text-red-400 mb-2">Failure Reason</p>
                <p className="text-white font-medium">{selectedLog.error_message}</p>
              </div>
              {selectedLog.details?.organization && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Organization</p>
                  <p className="text-white">{selectedLog.details.organization}</p>
                </div>
              )}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Additional Details</p>
                <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="bg-slate-900/50 p-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Health Details Modal */}
      {showApiModal && apiDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-3xl border-2 border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">API Health Details</h2>
                <p className="text-sm text-slate-400">{apiDetails.overall_message}</p>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="p-6 border-b border-slate-700">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Total APIs</p>
                  <p className="text-2xl font-bold text-white">{apiDetails.total_endpoints}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <p className="text-xs text-emerald-400 mb-1">Healthy</p>
                  <p className="text-2xl font-bold text-emerald-400">{apiDetails.healthy_count}</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-4">
                  <p className="text-xs text-orange-400 mb-1">Slow</p>
                  <p className="text-2xl font-bold text-orange-400">{apiDetails.slow_count}</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="text-xs text-red-400 mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{apiDetails.failed_count}</p>
                </div>
              </div>
            </div>

            {/* API Endpoints List */}
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">Individual API Status</h3>
              {apiDetails.endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    endpoint.status === 'healthy'
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : endpoint.status === 'slow'
                      ? 'bg-orange-500/5 border-orange-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          endpoint.status === 'healthy'
                            ? 'bg-emerald-500/20'
                            : endpoint.status === 'slow'
                            ? 'bg-orange-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {endpoint.status === 'healthy' ? (
                          <CheckCircle
                            className={`w-5 h-5 ${
                              endpoint.status === 'healthy'
                                ? 'text-emerald-400'
                                : endpoint.status === 'slow'
                                ? 'text-orange-400'
                                : 'text-red-400'
                            }`}
                          />
                        ) : endpoint.status === 'slow' ? (
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{endpoint.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{endpoint.endpoint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium mb-1 ${
                          endpoint.status === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : endpoint.status === 'slow'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {endpoint.status.toUpperCase()}
                      </div>
                      <p className="text-xs text-slate-400">
                        {endpoint.response_time > 0 ? `${endpoint.response_time}ms` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm ${
                      endpoint.status === 'healthy'
                        ? 'text-emerald-400'
                        : endpoint.status === 'slow'
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {endpoint.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex justify-end">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
