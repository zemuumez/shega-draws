"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EnterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 20px" }}><Loader2 className="animate-spin" /></div>}>
      <EnterRedirect />
    </Suspense>
  );
}

function EnterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <Loader2 className="animate-spin" style={{ margin: "0 auto 12px" }} />
      <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
        Opening Rimna Digital Lottery...
      </p>
    </div>
  );
}
