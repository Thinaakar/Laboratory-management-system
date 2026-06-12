'use client';

import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, string> = {
  patient: 'Patient registered successfully.',
  order: 'Order created. Generate invoice and collect payment.',
  appointment: 'Appointment scheduled successfully.',
  sample: 'Sample registered. Proceed to result entry.',
  payment: 'Payment recorded successfully.',
  approved: 'Report approved and ready for delivery.',
  results: 'Result saved. Pending pathologist approval.',
};

export function FlashBanner() {
  const params = useSearchParams();
  const key = params.get('success');
  if (!key || !MESSAGES[key]) return null;

  return (
    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      {MESSAGES[key]}
    </div>
  );
}
