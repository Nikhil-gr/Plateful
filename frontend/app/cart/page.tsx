"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartItem, getCart, saveCart } from "../../lib/marketplace";
import { SiteNav } from "../../components/SiteNav";
import { dashboardFor, getSession } from "../../lib/auth";

export default function Cart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getSession();

      if (session && session.user.role !== "customer") {
        router.replace(dashboardFor(session.user.role));
        return;
      }

      setItems(getCart());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.surplusPrice * item.cartQuantity,
        0,
      ),
    [items],
  );

  const update = (next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  };

  const session = getSession();
  const checkoutHref = session ? "/checkout" : "/account";

  if (!isReady) {
    return (
      <main className="info-page">
        <SiteNav />
      </main>
    );
  }

  return (
    <main className="info-page">
      <SiteNav />

      <section className="basket-page">
        <div className="basket-header">
          <div>
            <p className="eyebrow">Your basket</p>
            <h1>Basket</h1>
          </div>

          <span className="basket-count">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="basket-empty-card">
            <h2>Your basket is empty.</h2>

            <p>Browse live listings to reserve surplus food for pickup.</p>

            <Link className="big-cta" href="/">
              Browse food →
            </Link>
          </div>
        ) : (
          <div className="basket-layout">
            {/* ITEMS */}
            <div className="basket-items-card">
              {items.map((item) => (
                <article className="basket-product" key={item._id}>
                  <div className="basket-product-main">
                    <div>
                      <h2>{item.name}</h2>

                      <p>
                        {item.businessName} · {item.pickupTime}
                      </p>
                    </div>

                    <b className="basket-product-price">
                      ${(item.surplusPrice * item.cartQuantity).toFixed(2)}
                    </b>
                  </div>

                  <div className="basket-product-bottom">
                    <button
                      type="button"
                      onClick={() => {
                        const nextQuantity = item.cartQuantity - 1;

                        if (nextQuantity <= 0) {
                          update(
                            items.filter(
                              (cartItem) => cartItem._id !== item._id,
                            ),
                          );
                          return;
                        }

                        update(
                          items.map((cartItem) =>
                            cartItem._id === item._id
                              ? {
                                  ...cartItem,
                                  cartQuantity: nextQuantity,
                                }
                              : cartItem,
                          ),
                        );
                      }}
                    >
                      −
                    </button>

                    <span>{item.cartQuantity}</span>

                    <button
                      type="button"
                      disabled={item.cartQuantity >= item.quantity}
                      onClick={() =>
                        update(
                          items.map((cartItem) =>
                            cartItem._id === item._id
                              ? {
                                  ...cartItem,
                                  cartQuantity: Math.min(
                                    cartItem.cartQuantity + 1,
                                    cartItem.quantity,
                                  ),
                                }
                              : cartItem,
                          ),
                        )
                      }
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="basket-remove"
                      onClick={() =>
                        update(
                          items.filter((cartItem) => cartItem._id !== item._id),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* SUMMARY */}
            <aside className="basket-summary-card">
              <h2>Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Pickup</span>
                <span>Free</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <b>${total.toFixed(2)}</b>
              </div>

              <Link className="big-cta" href={checkoutHref}>
                {session ? "Checkout →" : "Log in to checkout →"}
              </Link>

              <p className="summary-note">
                Your food is reserved for pickup after checkout.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
