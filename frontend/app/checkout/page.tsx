"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "../../components/SiteNav";
import { CartItem, getCart, saveCart } from "../../lib/marketplace";
import { getSession } from "../../lib/auth";
import { api, authHeaders } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.surplusPrice * item.cartQuantity,
        0,
      ),
    [items],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getSession();
      if (!session) {
        router.replace("/account");
        return;
      }
      if (session.user.role !== "customer") {
        router.replace(
          session.user.role === "business" ? "/business" : "/admin",
        );
        return;
      }
      setAuthorized(true);
      setItems(getCart());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const completeOrder = async () => {
    try {
      if (new Set(items.map((item) => item.businessName)).size > 1) {
        throw new Error("Please reserve items from one business at a time");
      }
      const hasDemoItems = items.some((item) => item._id.startsWith("demo-"));
      const order = hasDemoItems
        ? { _id: `PF-${Date.now().toString().slice(-6)}`, totalAmount: total }
        : await api.post<{ _id: string; totalAmount: number }>(
            "/orders",
            {
              items: items.map((item) => ({
                listingId: item._id,
                quantity: item.cartQuantity,
              })),
            },
            { headers: authHeaders() },
          );
      localStorage.setItem(
        "plateful_latest_order",
        JSON.stringify({
          id: order._id,
          total: order.totalAmount,
          items,
          createdAt: new Date().toISOString(),
        }),
      );
      saveCart([]);
      router.push("/order-confirmation");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create your order",
      );
    }
  };

  if (!authorized) return <main className="info-page" />;
  return (
    <main className="info-page">
      <SiteNav />
      <section className="checkout-page">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>
            One delicious choice
            <br />
            <i>away from impact.</i>
          </h1>
          <p className="info-copy">
            No payment is taken in this demo. Confirm your pickup reservation
            and collect food at the listed time.
          </p>
        </div>
        {items.length ? (
          <aside className="checkout-card">
            <h2>Your order</h2>
            {items.map((item) => (
              <p key={item._id}>
                <span>
                  {item.cartQuantity}× {item.name}
                </span>
                <b>${(item.surplusPrice * item.cartQuantity).toFixed(2)}</b>
              </p>
            ))}
            <div className="checkout-total">
              <span>Total</span>
              <b>${total.toFixed(2)}</b>
            </div>
            <button className="big-cta" onClick={() => void completeOrder()}>
              Confirm pickup →
            </button>
            {message && <p className="form-message">{message}</p>}
            <small>Demo checkout · no card details needed</small>
          </aside>
        ) : (
          <div className="checkout-card">
            <h2>Your cart is empty</h2>
            <Link className="big-cta" href="/discover">
              Find food →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
