import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.js';
import { updateCustomerProfile } from '../../../services/customer.service.js';
import { extractErrorMessage } from '../../../services/api.js';
import {
  UserCircle,
  Building2,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Lock,
} from 'lucide-react';

export function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.customer?.companyName || '');
  const [contactNumber, setContactNumber] = useState(user?.customer?.contactNumber || '');
  const [billingAddress, setBillingAddress] = useState(user?.customer?.billingAddress || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCompanyName(user.customer?.companyName || '');
      setContactNumber(user.customer?.contactNumber || '');
      setBillingAddress(user.customer?.billingAddress || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await updateCustomerProfile({
        name,
        companyName: companyName || null,
        contactNumber: contactNumber || null,
        billingAddress: billingAddress || null,
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-on-surface">Billing & Account Profile</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Update your organization details, primary contact phone, and tax invoicing address.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-secondary-container/60 border border-secondary/30 text-on-secondary-container flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-secondary" />
          <span>Your customer profile details have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-5">
        {/* Read-Only Account Identity */}
        <div className="p-4 rounded-lg bg-surface-container-low/60 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-on-surface">{user?.email}</div>
              <div className="text-outline text-[11px]">Primary Workspace Login Identifier</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-outline font-semibold text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Role: {user?.role}</span>
          </div>
        </div>

        {/* Editable Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-on-surface font-medium flex items-center gap-1.5" htmlFor="custName">
              <UserCircle className="w-3.5 h-3.5 text-outline" />
              <span>Full Name</span>
            </label>
            <input
              id="custName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-on-surface font-medium flex items-center gap-1.5" htmlFor="custCompany">
              <Building2 className="w-3.5 h-3.5 text-outline" />
              <span>Company / Organization Name</span>
            </label>
            <input
              id="custCompany"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme SaaS Innovations Ltd"
              className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-on-surface font-medium flex items-center gap-1.5" htmlFor="custPhone">
              <Phone className="w-3.5 h-3.5 text-outline" />
              <span>Contact Number</span>
            </label>
            <input
              id="custPhone"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-on-surface font-medium flex items-center gap-1.5" htmlFor="custAddress">
              <MapPin className="w-3.5 h-3.5 text-outline" />
              <span>Official Billing Address</span>
            </label>
            <textarea
              id="custAddress"
              rows={3}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Building, Street, City, State, Postal Code..."
              className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-outline-variant/30">
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
