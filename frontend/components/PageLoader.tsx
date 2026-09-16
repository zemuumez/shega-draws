"use client";
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
export function PageLoader({initial = false}: {initial?: boolean}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(!initial);
  useEffect(() => {
    if (!initial) return;
    document.documentElement.dataset.rimnaLoading = "true";
    setVisible(true);
    const ready = () => {
      setVisible(false);
      delete document.documentElement.dataset.rimnaLoading;
      window.dispatchEvent(new Event("rimna:page-ready"));
    };
    const timer = setTimeout(ready, 850);
    return () => { clearTimeout(timer); ready(); };
  }, [initial]);
  if (!visible || pathname.startsWith('/studio')) return null;
  return <div className="rimna-page-loader" role="status" aria-live="polite" aria-label="Loading Rimna Lottery">
    <div className="rimna-loader-orbit">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/rimna-loader-logo.svg" alt="Rimna Lottery" width="200" height="192"/>
    </div>
    <span>Loading your next chance…</span>
  </div>;
}
