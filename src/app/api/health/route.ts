import { NextResponse } from 'next/server';

import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { ensureAppTables } from '@/lib/firebase/collections';

export async function GET() {
  const body: {
    ok: boolean;
    status: string;
    firebase: 'connected' | 'not_configured' | 'error';
    firebaseError?: string;
  } = {
    ok: true,
    status: 'running',
    firebase: 'not_configured',
  };

  if (!isFirebaseConfigured()) {
    return NextResponse.json(body);
  }

  try {
    const db = getAdminFirestore();
    await ensureAppTables(db);
    body.firebase = 'connected';
  } catch (e) {
    body.ok = false;
    body.firebase = 'error';
    body.firebaseError = e instanceof Error ? e.message : String(e);
    return NextResponse.json(body, { status: 503 });
  }

  return NextResponse.json(body);
}
