"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, authHeaders } from "../../lib/api";
import { CartItem, getCart, saveCart } from "../../lib/marketplace";
import { clearSession } from "../../lib/auth";
import { useRoleGuard } from "../../hooks/useRoleGuard";

type Order = {
  _id: string;
  status: string;
  totalAmount: number;
  pickupTime: string;
};

export default function CustomerPage() {
  const router = useRouter();
  const authorized = useRoleGuard("customer");
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState(
    "Log in as a customer, then reserve your basket.",
  );
  const loadOrders = async () => {
    try {
      setOrders(
        await api.get<Order[]>("/orders/mine", { headers: authHeaders() }),
      );
    } catch {
      /* Visitors can still view their basket. */
    }
  };
  useEffect(() => {
    if (!authorized) return;
    const timer = window.setTimeout(() => setItems(getCart()), 0);
    void (async () => {
      try {
        const nextOrders = await api.get<Order[]>("/orders/mine", {
          headers: authHeaders(),
        });
        setOrders(nextOrders);
      } catch {
        /* Visitors can still view their basket. */
      }
    })();
    return () => window.clearTimeout(timer);
  }, [authorized]);
  const reserve = async () => {
    try {
      if (!items.length) throw new Error("Your basket is empty");
      const businesses = new Set(items.map((item) => item.businessName));
      if (businesses.size > 1)
        throw new Error("Please reserve items from one business at a time");
      const order = await api.post<Order>(
        "/orders",
        {
          items: items.map((item) => ({
            listingId: item._id,
            quantity: item.cartQuantity,
          })),
        },
        { headers: authHeaders() },
      );
      saveCart([]);
      setItems([]);
      setMessage(`Order created — ${order.status.replaceAll("_", " ")}.`);
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not reserve your basket",
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
        <p className="eyebrow">Customer center</p>
        <h1>Orders, pickup & profile.</h1>
        <div className="prototype-grid">
          <article>
            <h2>Your basket</h2>
            {items.length ? (
              <>
                <p>
                  {items.reduce((total, item) => total + item.cartQuantity, 0)}{" "}
                  item(s), $
                  {items
                    .reduce(
                      (total, item) =>
                        total + item.surplusPrice * item.cartQuantity,
                      0,
                    )
                    .toFixed(2)}
                </p>
                <button onClick={reserve}>Reserve pickup</button>
              </>
            ) : (
              <>
                <p>No items yet. Add a live listing from the marketplace.</p>
                <Link href="/">Browse food →</Link>
              </>
            )}
          </article>
          <article>
            <h2>Pickup status</h2>
            <p>{message}</p>
            <button onClick={() => void loadOrders()}>Refresh orders</button>
          </article>
          <article>
            <h2>Recent orders</h2>
            {orders.length ? (
              orders.map((order) => (
                <p key={order._id}>
                  <b>${order.totalAmount.toFixed(2)}</b> ·{" "}
                  {order.status.replaceAll("_", " ")}
                  <br />
                  Pickup: {order.pickupTime}
                </p>
              ))
            ) : (
              <p>Your completed reservations will appear here.</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
