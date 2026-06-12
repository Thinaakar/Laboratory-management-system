'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ModalPortalProps {
  children: React.ReactNode;
}

/** Renders modals on document.body so they aren't clipped by app-shell overflow. */
export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
