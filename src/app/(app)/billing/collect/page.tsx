'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CollectPaymentRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId');
    const query = invoiceId
      ? `?collect=1&invoiceId=${encodeURIComponent(invoiceId)}`
      : '?collect=1';
    router.replace(`/billing${query}`);
  }, [router, searchParams]);

  return null;
}

export default function CollectPaymentRedirectPage() {
  return (
    <Suspense fallback={null}>
      <CollectPaymentRedirect />
    </Suspense>
  );
}
