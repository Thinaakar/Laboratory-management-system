'use client';

import { useState } from 'react';

interface SupplierFormModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    contact: string;
    email?: string;
    gst?: string;
  }) => void;
}

export function SupplierFormModal({ onClose, onSave }: SupplierFormModalProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [gst, setGst] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-muted-border bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">New Supplier</h3>
        <p className="mt-1 text-sm text-muted">Add a vendor for reagents, kits, and consumables.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              name,
              contact,
              email: email || undefined,
              gst: gst || undefined,
            });
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Supplier name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. MedSupply India Pvt Ltd"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Contact phone</label>
            <input
              className="lims-input"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              placeholder="+91 98765 00000"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email (optional)</label>
            <input
              type="email"
              className="lims-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="orders@supplier.in"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">GST number (optional)</label>
            <input
              className="lims-input"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              placeholder="27AABCM1234A1Z5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
