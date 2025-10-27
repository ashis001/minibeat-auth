import React from 'react';
import { X, Shield, Users, Building2, Lock, Key, Activity, Database, Clock, AlertCircle } from 'lucide-react';

interface DocumentationProps {
  onClose: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-green/20 to-blue-600/20 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">MiniBeast Admin Portal</h1>
            <p className="text-slate-300">Centralized User & Organization Management System</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-8 space-y-8">
          {/* Overview */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-green" />
              System Overview
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              MiniBeast Admin Portal is a comprehensive authentication and authorization system that provides 
              centralized user management, role-based access control (RBAC), and organization-level licensing 
              for the MiniBeast platform. Built with enterprise-grade security and scalability in mind.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-brand-green font-bold text-2xl mb-1">Multi-Org</div>
                <div className="text-slate-400 text-sm">Support</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-brand-green font-bold text-2xl mb-1">JWT</div>
                <div className="text-slate-400 text-sm">Token-Based Auth</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-brand-green font-bold text-2xl mb-1">RBAC</div>
                <div className="text-slate-400 text-sm">Role-Based Access</div>
              </div>
            </div>
          </section>

          {/* Core Features */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-brand-green" />
              Core Features
            </h2>
            
            <div className="space-y-6">
              {/* User Management */}
              <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                    <p className="text-slate-300 mb-3">
                      Complete user lifecycle management with role assignments and permissions.
                    </p>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Create, update, and deactivate users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Role assignment (Admin, Manager, Viewer)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Password management and reset</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>User activity tracking and audit logs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Organization Management */}
              <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Organization Management</h3>
                    <p className="text-slate-300 mb-3">
                      Multi-tenant organization control with granular feature management.
                    </p>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Create and manage multiple organizations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>License type configuration (Trial, Professional, Enterprise)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Feature-level access control (Validator, Migrator, Reconciliator)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>User limit enforcement and tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Organization pause/resume capabilities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* License Management */}
              <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Key className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">License & Feature Control</h3>
                    <p className="text-slate-300 mb-3">
                      Sophisticated licensing system with real-time enforcement.
                    </p>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Expiration date tracking and alerts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Feature-level module access control</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>Automatic access blocking on expiration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-green mt-1">✓</span>
                        <span>License renewal and upgrade workflows</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Role-Based Access Control */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="h-6 w-6 text-brand-green" />
              Role-Based Access Control (RBAC)
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Admin Role</h4>
                    <p className="text-slate-400 text-sm">Full system access and management</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-1 text-slate-400 text-sm">
                  <li>✓ Manage all users and organizations</li>
                  <li>✓ Configure licenses and features</li>
                  <li>✓ Access system monitoring and database</li>
                  <li>✓ View audit logs and activity</li>
                </ul>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Manager Role</h4>
                    <p className="text-slate-400 text-sm">Organization-level management</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-1 text-slate-400 text-sm">
                  <li>✓ Manage users within their organization</li>
                  <li>✓ Deploy and configure modules</li>
                  <li>✓ View organization dashboards</li>
                  <li>✓ Limited administrative capabilities</li>
                </ul>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Viewer Role</h4>
                    <p className="text-slate-400 text-sm">Read-only access</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-1 text-slate-400 text-sm">
                  <li>✓ View dashboards and metrics</li>
                  <li>✓ Access validation reports</li>
                  <li>✓ No modification permissions</li>
                  <li>✓ Suitable for auditors and stakeholders</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security Architecture */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-green" />
              Security Architecture
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Authentication</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">JWT Tokens</div>
                      <div className="text-slate-400">Access & refresh token mechanism</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Password Security</div>
                      <div className="text-slate-400">Bcrypt hashing with salt rounds</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Session Management</div>
                      <div className="text-slate-400">Redis-based token storage</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Authorization</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Dual-Layer Control</div>
                      <div className="text-slate-400">Role + Organization features check</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Real-time Validation</div>
                      <div className="text-slate-400">Periodic role verification (30s)</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">License Enforcement</div>
                      <div className="text-slate-400">Automatic blocking on expiry</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-400 mb-1">Security Best Practices</h4>
                  <ul className="space-y-1 text-yellow-200/80 text-sm">
                    <li>• All passwords are hashed and never stored in plaintext</li>
                    <li>• Token expiration enforced with automatic refresh</li>
                    <li>• Role changes trigger immediate logout for security</li>
                    <li>• License violations block access at login and runtime</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Stack */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Database className="h-6 w-6 text-brand-green" />
              Technical Stack
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Backend</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Python FastAPI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>PostgreSQL Database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Redis Cache & Sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>SQLAlchemy ORM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Pydantic Validation</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Frontend</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>React 18 + TypeScript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Vite Build Tool</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Tailwind CSS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Axios HTTP Client</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">▸</span>
                    <span>Docker Containerized</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monitoring & Logs */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-green" />
              Monitoring & Activity Logs
            </h2>
            
            <div className="space-y-4">
              <p className="text-slate-300">
                Comprehensive monitoring system to track user activity, system health, and security events.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-green" />
                    Activity Tracking
                  </h4>
                  <ul className="space-y-1 text-slate-400 text-sm">
                    <li>• User login/logout events</li>
                    <li>• Role and permission changes</li>
                    <li>• Organization modifications</li>
                    <li>• Feature access attempts</li>
                  </ul>
                </div>
                
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-brand-green" />
                    System Monitoring
                  </h4>
                  <ul className="space-y-1 text-slate-400 text-sm">
                    <li>• Real-time database viewer</li>
                    <li>• User count and metrics</li>
                    <li>• License expiration alerts</li>
                    <li>• System health checks</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* License Types */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Key className="h-6 w-6 text-brand-green" />
              License Types & Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-5 rounded-lg border border-blue-500/30">
                <div className="text-center mb-4">
                  <div className="text-blue-400 font-bold text-xl mb-1">Trial</div>
                  <div className="text-slate-400 text-sm">30 Days</div>
                </div>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Up to 10 users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>All modules access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Basic support</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 p-5 rounded-lg border border-brand-green/30">
                <div className="text-center mb-4">
                  <div className="text-brand-green font-bold text-xl mb-1">Professional</div>
                  <div className="text-slate-400 text-sm">Annual License</div>
                </div>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Up to 50 users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>All modules access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Custom integrations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 p-5 rounded-lg border border-purple-500/30">
                <div className="text-center mb-4">
                  <div className="text-purple-400 font-bold text-xl mb-1">Enterprise</div>
                  <div className="text-slate-400 text-sm">Custom Terms</div>
                </div>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>Unlimited users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>All modules access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>SLA guarantees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    <span>On-premise deployment</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Key API Endpoints</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-brand-green">POST</span> <span className="text-slate-300">/auth/login</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-blue-400">GET</span> <span className="text-slate-300">/auth/me</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-blue-400">GET</span> <span className="text-slate-300">/license/organization/status/:id</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-brand-green">POST</span> <span className="text-slate-300">/admin/organizations</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-purple-400">PUT</span> <span className="text-slate-300">/admin/users/:id</span>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="bg-gradient-to-r from-brand-green/10 to-blue-600/10 rounded-xl p-6 border border-brand-green/30">
            <h2 className="text-2xl font-bold text-white mb-4">Administrative Support</h2>
            <p className="text-slate-300 mb-4">
              For administrative assistance, technical support, or license inquiries.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="text-sm">
                <span className="text-slate-400">Email:</span>{' '}
                <span className="text-brand-green font-medium">support@dataction.com</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">System:</span>{' '}
                <span className="text-white font-medium">MiniBeast Admin Portal by DataAction</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
