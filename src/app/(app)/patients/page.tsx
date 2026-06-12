'use client';



import { Plus } from 'lucide-react';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { PageHeader } from '@/components/lims/page-header';

import { FlashBanner } from '@/components/lims/flash-banner';

import { PatientRegistrationModal } from '@/components/lims/patients/patient-registration-modal';

import { getPatients } from '@/lib/data/patients-store';

import type { Patient } from '@/lib/types/lims';

import { formatDate, formatDateTime } from '@/lib/utils';



function PatientsContent() {

  const searchParams = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>([]);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');



  const refresh = useCallback(() => {

    setPatients(getPatients());

  }, []);



  useEffect(() => {

    refresh();

  }, [refresh]);



  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowModal(true);
      window.history.replaceState(null, '', '/patients');
    }
  }, [searchParams]);



  const filtered = useMemo(() => {

    const q = search.trim().toLowerCase();

    if (!q) return patients;

    return patients.filter(

      (p) =>

        p.firstName?.toLowerCase().includes(q) ||

        p.lastName?.toLowerCase().includes(q) ||

        p.name.toLowerCase().includes(q) ||

        p.id.toLowerCase().includes(q) ||

        p.phone.includes(q) ||

        p.email?.toLowerCase().includes(q),

    );

  }, [patients, search]);



  return (

    <>

      <PageHeader

        title="Patients"

        description="Patient registry and demographics"

        action={

          <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">

            <Plus className="h-4 w-4" />

            Register Patient

          </button>

        }

      />



      <FlashBanner />

      {successMessage && (

        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

          {successMessage}

        </div>

      )}



      <div className="overflow-hidden rounded-xl border border-muted-border bg-white shadow-card-md">

        <div className="border-b border-muted-border bg-muted-bg/40 px-5 py-4">

          <input

            type="search"

            className="lims-input max-w-sm bg-white"

            placeholder="Search by name, ID, or phone…"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

          />

        </div>



        <div className="overflow-x-auto">

          <table className="lims-table">

            <thead>

              <tr>

                <th>Patient ID</th>

                <th>Name</th>

                <th>Phone</th>

                <th>Email</th>

                <th>Age</th>

                <th>DOB</th>

                <th>Gender</th>

                <th>Type</th>

                <th>Registered</th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 ? (

                <tr>

                  <td colSpan={9} className="py-10 text-center text-sm text-muted">

                    No patients found. Register a new patient to get started.

                  </td>

                </tr>

              ) : (

                filtered.map((p) => (

                  <tr key={p.id}>

                    <td className="font-mono text-xs">{p.id}</td>

                    <td className="font-medium text-slate-900">{p.name}</td>

                    <td>{p.phone}</td>

                    <td>{p.email ?? '—'}</td>

                    <td>{p.age ?? '—'}</td>

                    <td>{p.dateOfBirth ? formatDate(p.dateOfBirth) : '—'}</td>

                    <td>{p.gender}</td>

                    <td>{p.patientType ?? '—'}</td>

                    <td>{formatDateTime(p.createdAt)}</td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>



      {showModal && (

        <PatientRegistrationModal

          onClose={() => setShowModal(false)}

          onSaved={(patient) => {

            refresh();

            setShowModal(false);

            setSuccessMessage(`Patient ${patient.id} registered successfully.`);

          }}

        />

      )}

    </>

  );

}



export default function PatientsPage() {

  return (

    <div>

      <Suspense fallback={null}>

        <PatientsContent />

      </Suspense>

    </div>

  );

}


