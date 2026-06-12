'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPatientPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patients?register=1');
  }, [router]);

  return null;
}
