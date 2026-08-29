"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession, type Session } from "@/lib/auth";
import { getCart } from "@/lib/marketplace";

export function SiteNav() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load current session
    setSession(getSession());

    const updateCartCount = () => {
      const cart = getCart();

      const count = cart.reduce((total, item) => total + item.cartQuantity, 0);

      setCartCount(count);
    };

    // Get initial cart count
    updateCartCount();

    // Listen for cart changes in this tab
    window.addEventListener("cart-updated", updateCartCount);

    // Listen for localStorage changes from another tab
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const signOut = () => {
    clearSession();
    setSession(null);
    router.replace("/");
  };

  return (
    <header className="site-nav">
      {/* BRAND */}
      <Link className="brand" href="/">
        <span>p</span>
        plateful
      </Link>

      {/* MAIN NAV */}
      <nav>
        <Link href="/discover">Discover</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/impact">Our impact</Link>
      </nav>

      {/* RIGHT SIDE */}
      <div>
        {session ? (
          <>
            <Link className="account-link" href="/profile">
              <span className="mini-avatar">
                {session.user.name.charAt(0).toUpperCase()}
              </span>

              {session.user.name}
            </Link>

            {session.user.role === "customer" && (
              <Link className="nav-basket" href="/cart">
                Basket
                {cartCount > 0 && (
                  <span className="cart-count">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            <button className="nav-join" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/business">For businesses</Link>

            <Link className="nav-join" href="/account">
              Join Plateful
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
