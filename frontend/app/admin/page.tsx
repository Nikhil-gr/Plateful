"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, authHeaders } from "../../lib/api";
import { clearSession } from "../../lib/auth";
import { useRoleGuard } from "../../hooks/useRoleGuard";
type Stats = {
  users: number;
  businesses: number;
  listings: number;
  orders: number;
  revenue: number;
};
export default function AdminPage() {
  const router = useRouter();
  const authorized = useRoleGuard("admin");
  const [stats, setStats] = useState<Stats>();
  const [message, setMessage] = useState(
    "Log in as an admin, then load live platform metrics.",
  );
  const load = async () => {
    try {
      setStats(
        await api.get<Stats>("/admin/stats", { headers: authHeaders() }),
      );
      setMessage("Live platform summary loaded.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load summary",
      );
    }
  };
  if (!authorized) return <main className="portal" />;

  return (
    <main className="portal">
      <Link className="brand" href="/">
        <span>p</span> plateful
      </Link>
      <button
        className="sign-out"
        onClick={() => {
          clearSession();
          router.replace("/");
        }}
      >
        Sign out
      </button>
      <section className="dashboard">
        <p className="eyebrow">Admin dashboard</p>
        <h1>Keep the marketplace healthy.</h1>
        <button className="primary" onClick={load}>
          Load platform overview
        </button>
        <p className="form-message">{message}</p>
        {stats && (
          <div className="stats-grid">
            {Object.entries(stats).map(([label, value]) => (
              <article key={label}>
                <b>
                  {typeof value === "number" && label === "revenue"
                    ? `$${value.toFixed(2)}`
                    : value}
                </b>
                <span>{label}</span>
              </article>
            ))}
          </div>
        )}
        <div className="api-note">
          Admin API includes user management, all orders, listings, and
          aggregate statistics. Use <code>GET /api/admin/users</code>,{" "}
          <code>PATCH /api/admin/users/:id</code>, and{" "}
          <code>GET /api/admin/orders</code>.
        </div>
      </section>
    </main>
  );
}
