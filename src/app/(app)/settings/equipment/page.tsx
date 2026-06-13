'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { StatusBadge } from '@/components/lims/status-badge';
import { EquipmentFormModal } from '@/components/lims/operations/equipment-form-modal';
import { addEquipment, getEquipment } from '@/lib/data/equipment-store';
import type { Equipment } from '@/lib/types/lims';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setEquipment(getEquipment());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Equipment — analyzers, calibration, and maintenance">
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Equipment
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Model</th>
              <th>Serial</th>
              <th>Last Calibration</th>
              <th>Next Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => {
              const dueSoon =
                eq.nextCalibrationDue &&
                new Date(eq.nextCalibrationDue) < new Date(Date.now() + 30 * 86400000);
              return (
                <tr key={eq.id}>
                  <td className="font-medium text-slate-900">{eq.name}</td>
                  <td>{eq.model ?? '—'}</td>
                  <td className="font-mono text-xs">{eq.serialNumber ?? '—'}</td>
                  <td>{eq.lastCalibration ? formatDate(eq.lastCalibration) : '—'}</td>
                  <td>{eq.nextCalibrationDue ? formatDate(eq.nextCalibrationDue) : '—'}</td>
                  <td>
                    {dueSoon && eq.status === 'Active' ? (
                      <StatusBadge label="Calibration Due" variant="warning" />
                    ) : (
                      <StatusBadge
                        label={eq.status}
                        variant={eq.status === 'Active' ? 'success' : 'warning'}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <EquipmentFormModal
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            addEquipment(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
