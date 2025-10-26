import React, { useState, useEffect } from 'react';
import { licenseApi } from '@/api/authClient';
import { Shield, Calendar, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface License {
  organization_id: string;
  organization_name: string;
  license_type: string;
  is_valid: boolean;
  expires_at: string;
  days_remaining: number;
  features_enabled: string[];
  max_users: number;
  current_users: number;
}

export const LicenseStatus: React.FC = () => {
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLicenseStatus();
  }, []);

  const loadLicenseStatus = async () => {
    setIsLoading(true);
    try {
      const data = await licenseApi.getStatus();
      setLicense(data);
    } catch (error) {
      console.error('Failed to load license status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <p className="text-slate-400">Failed to load license information</p>
      </div>
    );
  }

  const isExpiringSoon = license.days_remaining <= 30 && license.days_remaining > 0;
  const isExpired = !license.is_valid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">License Status</h2>
        <p className="text-slate-400 mt-1">View your organization's license information</p>
      </div>

      {/* Status Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              {license.organization_name}
            </h3>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              license.license_type === 'enterprise'
                ? 'bg-purple-900/50 text-purple-300'
                : license.license_type === 'standard'
                ? 'bg-blue-900/50 text-blue-300'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {license.license_type.toUpperCase()} LICENSE
            </span>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isExpired
              ? 'bg-red-900/30 text-red-400'
              : isExpiringSoon
              ? 'bg-amber-900/30 text-amber-400'
              : 'bg-slate-900/30 text-brand-green'
          }`}>
            {isExpired ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">EXPIRED</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">ACTIVE</span>
              </>
            )}
          </div>
        </div>

        {/* License Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Expiration */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-400">Expires</span>
            </div>
            <p className="text-xl font-semibold text-white">
              {format(new Date(license.expires_at), 'MMM d, yyyy')}
            </p>
            <p className={`text-sm mt-1 ${
              isExpired
                ? 'text-red-400'
                : isExpiringSoon
                ? 'text-amber-400'
                : 'text-brand-green'
            }`}>
              {isExpired
                ? `Expired ${Math.abs(license.days_remaining)} days ago`
                : `${license.days_remaining} days remaining`}
            </p>
          </div>

          {/* Users */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-400">Users</span>
            </div>
            <p className="text-xl font-semibold text-white">
              {license.current_users} / {license.max_users}
            </p>
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    license.current_users >= license.max_users
                      ? 'bg-red-500'
                      : 'bg-brand-green'
                  }`}
                  style={{ width: `${(license.current_users / license.max_users) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-400">Features</span>
            </div>
            <p className="text-xl font-semibold text-white">
              {license.features_enabled.length}
            </p>
            <p className="text-sm text-slate-400 mt-1">modules enabled</p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Enabled Features:</h4>
          <div className="flex flex-wrap gap-2">
            {license.features_enabled.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 bg-slate-900/30 text-brand-green rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Warning Messages */}
        {isExpiringSoon && (
          <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-medium">License Expiring Soon</p>
              <p className="text-amber-400/80 text-sm mt-1">
                Your license will expire in {license.days_remaining} days. Please contact your administrator to renew.
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">License Expired</p>
              <p className="text-red-400/80 text-sm mt-1">
                Your license has expired. Please contact your administrator immediately to restore access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
