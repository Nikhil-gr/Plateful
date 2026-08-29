"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardFor, getSession, type UserRole } from "@/lib/auth";

export function useRoleGuard(role: UserRole) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/account");
      return;
    }

    if (session.user.role !== role) {
      router.replace(dashboardFor(session.user.role));
      return;
    }

    const timer = window.setTimeout(() => setAuthorized(true), 0);
    return () => window.clearTimeout(timer);
  }, [role, router]);

  return authorized;
}
