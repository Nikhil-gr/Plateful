"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteNav } from "../../components/SiteNav";

type Order = { id: string; total: number; items: unknown[] };
export default function OrderConfirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = localStorage.getItem("plateful_latest_order");
      if (value) setOrder(JSON.parse(value));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <main className="info-page">
      <SiteNav />
      <section className="confirmation">
        <span>✓</span>
        <p className="eyebrow">Pickup reserved</p>
        <h1>
          Good food is on
          <br />
          <i>its way to you.</i>
        </h1>
        <p className="info-copy">
          {order
            ? `Order ${order.id} is confirmed. Your total is $${order.total.toFixed(2)}. Check your basket items for their pickup time.`
            : "Your reservation is confirmed. Check your basket for pickup details."}
        </p>
        <div className="inline-links">
          <Link href="/discover">Keep browsing</Link>
          <Link href="/profile">View account</Link>
        </div>
      </section>
    </main>
  );
}
