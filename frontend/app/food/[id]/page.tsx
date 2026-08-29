"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteNav } from "../../../components/SiteNav";
import { useListing } from "../../../hooks/useListing";
import { getSession } from "../../../lib/auth";
import { demoListings } from "../../../lib/catalog";
import { addToCart } from "../../../lib/marketplace";

export default function FoodDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const demoItem = demoListings.find((listing) => listing.id === params.id);
  const { data: liveItem, isLoading } = useListing(
    demoItem ? undefined : params.id,
  );
  const item =
    demoItem ??
    (liveItem
      ? {
          id: liveItem._id,
          name: liveItem.name,
          shop: liveItem.businessName ?? "Local business",
          type:
            typeof liveItem.category === "string"
              ? liveItem.category
              : liveItem.category.name,
          price: liveItem.surplusPrice,
          was: liveItem.originalPrice,
          pickup: liveItem.pickupTime,
          pickupLocation: liveItem.pickupLocation,
          quantity: liveItem.quantity,
          image: liveItem.image,
          description: liveItem.description,
        }
      : undefined);
  const [message, setMessage] = useState("");
  const [canShop, setCanShop] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const role = getSession()?.user.role;
      setCanShop(role !== "business" && role !== "admin");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <main className="info-page">
        <SiteNav />
        <p className="page-status">Loading food listing…</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="info-page">
        <SiteNav />
        <section className="info-hero">
          <h1>Food listing not found.</h1>
          <Link className="big-cta" href="/discover">
            Back to Discover →
          </Link>
        </section>
      </main>
    );
  }

  const hasPhoto =
    item.image?.startsWith("data:image/") || item.image?.startsWith("https://");
  const add = () => {
    const session = getSession();
    if (!session) {
      router.push("/account");
      return;
    }
    if (session.user.role !== "customer") return;

    addToCart({
      _id: item.id,
      name: item.name,
      businessName: item.shop,
      category: item.type,
      originalPrice: item.was,
      surplusPrice: item.price,
      quantity: item.quantity,
      pickupLocation:
        "pickupLocation" in item ? item.pickupLocation : "Local pickup",
      pickupTime: item.pickup,
      availableUntil: "",
    });
    setMessage("Added to your cart");
  };

  return (
    <main className="info-page">
      <SiteNav />
      <section className="product-shell">
        <Link className="product-back" href="/discover">
          ← Back to marketplace
        </Link>
        <div className="product-page">
          <div className="product-media">
            {hasPhoto ? (
              <div
                className="product-photo"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            ) : (
              <div className="product-photo product-photo-empty">
                <span>{item.image ?? "Food photo coming soon"}</span>
              </div>
            )}
            <span className="product-quantity">{item.quantity} left today</span>
          </div>

          <div className="product-details">
            <p className="eyebrow">
              {item.type} · {item.shop}
            </p>
            <h1>{item.name}</h1>
            <p className="info-copy">{item.description}</p>
            <div className="pickup-card">
              <span>Pickup window</span>
              <strong>{item.pickup}</strong>
              {"pickupLocation" in item && <small>{item.pickupLocation}</small>}
            </div>
            <div className="product-buy-row">
              <p className="product-price">
                <b>${item.price.toFixed(2)}</b>{" "}
                <del>${item.was.toFixed(2)}</del>
              </p>
              {canShop && (
                <button className="big-cta" onClick={add}>
                  Add to cart →
                </button>
              )}
            </div>
            {canShop && message && (
              <p className="form-message">
                ✓ {message} · <Link href="/cart">View cart</Link>
              </p>
            )}
            <p className="product-note">
              Reserve now, then collect from the business during the pickup
              window.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
