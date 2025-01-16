"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function UnauthorizedGate({ role }: { role: string }) {
  const router = useRouter();
  const renderedOnce = useRef(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setTimeout(() => {
        toast.warning(`UNAUTHORIZED: You must be a ${role} to view this page.`);
      }, 0);

      // After 2 seconds, show loading
      setTimeout(() => {
        const loadingToast = toast.loading("Redirecting...");

        // After 1.5 more seconds, redirect and cleanup
        setTimeout(() => {
          toast.dismiss(loadingToast);
          router.push("/wholesaler/profile");
        }, 3000);
      }, 2500);
    };

    if (!renderedOnce.current) {
      handleUnauthorized();
      renderedOnce.current = true;
    }
  }, [role, router]);

  return null;
}
