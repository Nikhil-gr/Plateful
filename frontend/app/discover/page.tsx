"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "../../components/SiteNav";
import { categories, demoListings } from "../../lib/catalog";
import { addToCart } from "../../lib/marketplace";
import { getSession } from "../../lib/auth";
import { useListings } from "../../hooks/useListing";

function DiscoverContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState("");
  const [canShop, setCanShop] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const role = getSession()?.user.role;
      setCanShop(role !== "business" && role !== "admin");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const { data } = useListings({
    search: query || undefined,
    category: category === "All" ? undefined : category,
  });
  const liveListings = data?.listings ?? [];
  const marketplaceItems = liveListings.length
    ? liveListings.map((item) => ({
        id: item._id,
        name: item.name,
        shop: item.businessName ?? "Local business",
        type:
          typeof item.category === "string"
            ? item.category
            : item.category.name,
        price: item.surplusPrice,
        was: item.originalPrice,
        pickup: item.pickupTime,
        quantity: item.quantity,
        distance: "Nearby",
        image: item.image,
        featured: false,
      }))
    : demoListings;
  const listings = useMemo(
    () =>
      marketplaceItems.filter(
        (item) =>
          (category === "All" || item.type === category) &&
          `${item.name} ${item.shop} ${item.type}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, marketplaceItems, query],
  );
  const add = (id: string) => {
    const session = getSession();
    if (!session) {
      router.push("/account");
      return;
    }
    if (session.user.role !== "customer") return;
    const item = marketplaceItems.find((listing) => listing.id === id)!;
    addToCart({
      _id: item.id,
      name: item.name,
      businessName: item.shop,
      category: item.type,
      originalPrice: item.was,
      surplusPrice: item.price,
      quantity: item.quantity,
      pickupLocation: "Local pickup",
      pickupTime: item.pickup,
      availableUntil: "",
    });
    setToast(`${item.name} added to cart`);
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <main className="info-page">
      <SiteNav />
      <section className="discover-hero">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>
            Good food, priced
            <br />
            <i>for today.</i>
          </h1>
          <p>
            Fresh surplus from local favourites, ready for pickup before it goes
            to waste.
          </p>
        </div>
        <div className="discover-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search food, shops, or cravings"
            aria-label="Search food"
          />
          <span>⌕</span>
        </div>
      </section>
      <section className="discover-content">
        <div className="category-row">
          {categories.map((name) => (
            <button
              key={name}
              className={category === name ? "active" : ""}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="marketplace-heading">
          <div>
            <p className="eyebrow">Available near Portland</p>
            <h2>
              {category === "All"
                ? "Today’s surplus picks"
                : `${category} picks`}
            </h2>
          </div>
          <p>{listings.length} bags available today</p>
        </div>
        <div className="food-grid discover-grid">
          {listings.map((item, index) => (
            <article className="food-card" key={item.id}>
              <Link
                href={`/food/${item.id}`}
                className={`food-image food-${(index % 4) + 1}`}
              >
                {item.image?.startsWith("data:image/") ? (
                  <span
                    className="listing-photo"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                ) : (
                  <span>{item.image ?? "Food"}</span>
                )}
                {item.featured && <label>Best value</label>}
              </Link>
              <div className="food-info">
                <p className="shop">
                  {item.shop} <span>• {item.distance}</span>
                </p>
                <h3>
                  <Link href={`/food/${item.id}`}>{item.name}</Link>
                </h3>
                <p className="pickup">
                  ◷ {item.pickup} · {item.quantity} left
                </p>
                <div className="food-footer">
                  <p>
                    <b>${item.price.toFixed(2)}</b>{" "}
                    <del>${item.was.toFixed(2)}</del>
                  </p>
                  {canShop && (
                    <button onClick={() => add(item.id)}>
                      Add <span>+</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!listings.length && (
          <p className="empty">
            No food matches that search. Try another craving.
          </p>
        )}
        <section className="market-cta">
          <div>
            <p className="eyebrow">For local food businesses</p>
            <h2>Turn today’s surplus into tomorrow’s regulars.</h2>
            <p>
              List extra food in minutes and meet new customers in your
              neighbourhood.
            </p>
          </div>
          <Link className="big-cta" href="/account">
            Join as a business →
          </Link>
        </section>
      </section>
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}

export default function Discover() {
  return (
    <Suspense fallback={<main className="info-page" />}>
      <DiscoverContent />
    </Suspense>
  );
}
