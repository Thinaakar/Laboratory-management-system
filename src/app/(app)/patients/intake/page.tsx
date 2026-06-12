'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/lims/page-header';
import { PatientIntakeForm } from '@/components/lims/patients/patient-intake-form';

export default function PatientIntakePage() {
  return (
    <div>
      <PageHeader
        title="Patient Intake"
        description="Register patient, schedule appointment, and create order in one step"
        action={
          <Link href="/patients" className="lims-btn-secondary">
            Back to list
          </Link>
        }
      />
      <PatientIntakeForm />
    </div>
  );
}
