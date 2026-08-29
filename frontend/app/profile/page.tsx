"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteNav } from "../../components/SiteNav";
import { dashboardFor, getSession, type Session } from "../../lib/auth";

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSession(getSession()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <main className="info-page">
      <SiteNav />
      <section className="profile-page">
        <p className="eyebrow">Your account</p>
        <h1>
          {session ? `Hello, ${session.user.name}.` : "Your Plateful account."}
        </h1>
        {session ? (
          <div className="profile-card">
            <div className="avatar">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <b>{session.user.name}</b>
              <p>{session.user.email ?? "Signed-in Plateful member"}</p>
              <p className="role-label">{session.user.role} account</p>
            </div>
            <Link className="big-cta" href={dashboardFor(session.user.role)}>
              Open dashboard →
            </Link>
          </div>
        ) : (
          <div className="profile-card">
            <p>Log in to see your account and reservations.</p>
            <Link className="big-cta" href="/account">
              Log in →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
