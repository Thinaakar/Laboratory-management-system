'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAppointmentPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/patients/intake');
  }, [router]);
  return null;
}
