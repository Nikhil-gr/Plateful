"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession, type Session } from "@/lib/auth";
import { getCart } from "@/lib/marketplace";

export function SiteNav() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load current session
    setSession(getSession());

    const updateCartCount = () => {
      const cart = getCart();

      const count = cart.reduce((total, item) => total + item.cartQuantity, 0);

      setCartCount(count);
    };

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
    setMenuOpen(false);
    router.replace("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-nav">
      {/* BRAND */}
      <Link className="brand" href="/" onClick={closeMenu}>
        <span>p</span>
        plateful
      </Link>

      {/* MAIN NAV */}
      <nav className={menuOpen ? "mobile-open" : ""}>
        <Link href="/discover" onClick={closeMenu}>
          Discover
        </Link>

        <Link href="/how-it-works" onClick={closeMenu}>
          How it works
        </Link>

        <Link href="/impact" onClick={closeMenu}>
          Our impact
        </Link>

        {/* MOBILE ONLY ACTIONS */}
        <div className="mobile-nav-actions">
          {session ? (
            <>
              <Link
                className="account-link"
                href="/profile"
                onClick={closeMenu}
              >
                <span className="mini-avatar">
                  {session.user.name.charAt(0).toUpperCase()}
                </span>

                {session.user.name}
              </Link>

              {session.user.role === "customer" && (
                <Link className="nav-basket" href="/cart" onClick={closeMenu}>
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
              <Link href="/business" onClick={closeMenu}>
                For businesses
              </Link>

              <Link className="nav-join" href="/account" onClick={closeMenu}>
                Join Plateful
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* DESKTOP RIGHT SIDE */}
      <div className="nav-right">
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

      {/* MOBILE HAMBURGER */}
      <button
        type="button"
        className={`mobile-menu-button ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
