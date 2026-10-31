import React, { useState, useEffect } from 'react';
import {
  getStaffList,
  createStaffMember,
  toggleStaffStatus,
} from '../../../services/staff.service.js';
import { StaffUser } from '../../../types/staff.js';
import { extractErrorMessage } from '../../../services/api.js';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  X,
  Loader2,
  Shield,
  Key,
} from 'lucide-react';

export function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Add Staff Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaffList();
      setStaffList(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleToggleStatus = async (staff: StaffUser) => {
    try {
      const updated = await toggleStaffStatus(staff.id, !staff.isActive);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, isActive: updated.isActive } : s))
      );
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await createStaffMember({ name, email });
      setCreatedTempPassword(res.temporaryPassword || 'Generated');
      setStaffList((prev) => [res.staff, ...prev]);
    } catch (err) {
      setModalError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (createdTempPassword) {
      navigator.clipboard.writeText(createdTempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setName('');
    setEmail('');
    setCreatedTempPassword(null);
    setModalError(null);
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold text-on-surface">Staff Management</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Provision staff operator credentials and control access permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Staff</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Container Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Search Filter Header */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-9 pl-9 pr-3 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border-none"
            />
          </div>
          <span className="text-xs text-outline font-medium">
            {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low/60 text-outline border-b border-outline-variant/30 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Date Provisioned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-outline">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading staff directory...</span>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-outline">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface">{staff.name}</div>
                          <div className="text-outline text-[11px]">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/30">
                        <Shield className="w-3 h-3 text-secondary" />
                        STAFF / OPS
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1 text-secondary font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-error font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">
                      {new Date(staff.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                          staff.isActive
                            ? 'text-error bg-error-container/40 hover:bg-error-container'
                            : 'text-secondary bg-secondary-container/40 hover:bg-secondary-container'
                        }`}
                      >
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-6 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
              <h2 className="font-heading text-base font-bold text-on-surface">
                Provision Staff Operator
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded text-outline hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdTempPassword ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-secondary-container/50 text-secondary text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Staff account successfully provisioned with role <strong>STAFF</strong>.</span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 space-y-2">
                  <span className="text-[11px] font-semibold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-primary" />
                    Temporary Security Password
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-surface-container-lowest rounded border border-outline-variant/60">
                    <code className="text-xs font-mono font-bold text-on-surface select-all">
                      {createdTempPassword}
                    </code>
                    <button
                      onClick={handleCopyPassword}
                      className="px-2 py-1 rounded bg-primary text-on-primary text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-outline">
                    Share this initial temporary password with the staff operator securely.
                  </p>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStaff} className="space-y-4">
                {modalError && (
                  <div className="p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-on-surface font-medium" htmlFor="staffName">
                    Full Name
                  </label>
                  <input
                    id="staffName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-on-surface font-medium" htmlFor="staffEmail">
                    Staff Work Email
                  </label>
                  <input
                    id="staffEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@brightloop.io"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="p-3 bg-surface-container-low rounded-lg text-[11px] text-outline">
                  🛡️ Staff accounts receive access to operational dashboards and customer triage. Only administrators can provision or deactivate staff.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-3.5 h-9 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name || !email}
                    className="px-4 h-9 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Provisioning...</span>
                      </>
                    ) : (
                      <span>Provision Staff Account</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
