'use client';

import { useState } from 'react';
import type { Equipment } from '@/lib/types/lims';
import { EQUIPMENT_STATUS_OPTIONS } from '@/lib/data/equipment-store';

interface EquipmentFormModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    model?: string;
    serialNumber?: string;
    lastCalibration?: string;
    nextCalibrationDue?: string;
    status: Equipment['status'];
  }) => void;
}

export function EquipmentFormModal({ onClose, onSave }: EquipmentFormModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [lastCalibration, setLastCalibration] = useState('');
  const [nextCalibrationDue, setNextCalibrationDue] = useState('');
  const [status, setStatus] = useState<Equipment['status']>('Active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Equipment</h3>
        <p className="mt-1 text-sm text-muted">Register lab instruments and track calibration.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              name,
              model: model || undefined,
              serialNumber: serialNumber || undefined,
              lastCalibration: lastCalibration || undefined,
              nextCalibrationDue: nextCalibrationDue || undefined,
              status,
            });
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Equipment name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. CBC Analyzer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Model</label>
              <input
                className="lims-input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Sysmex XN-1000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Serial number</label>
              <input
                className="lims-input"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="SN-CBC-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Last calibration</label>
              <input
                type="date"
                className="lims-input"
                value={lastCalibration}
                onChange={(e) => setLastCalibration(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Next due</label>
              <input
                type="date"
                className="lims-input"
                value={nextCalibrationDue}
                onChange={(e) => setNextCalibrationDue(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <select
              className="lims-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as Equipment['status'])}
            >
              {EQUIPMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
