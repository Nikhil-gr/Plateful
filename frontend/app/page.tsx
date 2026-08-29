"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, MapPin, ArrowRight, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { SiteNav } from "../components/SiteNav";
import { categories, demoListings } from "../lib/catalog";
import { addToCart as addToBrowserCart, getCart } from "../lib/marketplace";
import { getSession } from "../lib/auth";
import { useListings } from "../hooks/useListing";

type Listing = {
  id: string;
  name: string;
  shop: string;
  type: string;
  price: number;
  was: number;
  pickup: string;
  quantity: number;
  distance: string;
  image?: string;
  featured?: boolean;
};

export default function Home() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getSession());

    setCartCount(
      getCart().reduce((total, item) => total + item.cartQuantity, 0),
    );
  }, []);

  const filters = useMemo(
    () => ({
      search: query.trim() || undefined,
      category: category === "All" ? undefined : category,
      sort: "newest",
    }),
    [query, category],
  );

  const { data, isLoading, isError } = useListings(filters);

  const apiListings = data?.listings ?? [];

  const availableListings: Listing[] =
    apiListings.length > 0
      ? apiListings.map((item: any) => ({
          id: item._id,
          name: item.name,
          shop: item.businessName || "Local business",
          type:
            typeof item.category === "string"
              ? item.category
              : item.category?.name || "Other",
          price: item.surplusPrice,
          was: item.originalPrice,
          pickup: item.pickupTime,
          quantity: item.quantity,
          distance: "Nearby",
          image: item.image,
          featured: false,
        }))
      : demoListings;

  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();

    return availableListings.filter(
      (item) =>
        (category === "All" || item.type === category) &&
        `${item.name} ${item.shop} ${item.type}`.toLowerCase().includes(search),
    );
  }, [query, category, availableListings]);

  const addToCart = (item: Listing) => {
    const currentSession = getSession();

    if (!currentSession) {
      router.push("/account");
      return;
    }

    if (currentSession.user.role !== "customer") {
      return;
    }

    const cart = addToBrowserCart({
      _id: item.id,
      name: item.name,
      businessName: item.shop,
      category: item.type,
      originalPrice: item.was,
      surplusPrice: item.price,
      quantity: item.quantity,
      pickupLocation: "",
      pickupTime: item.pickup,
      availableUntil: "",
    });

    setCartCount(
      cart.reduce((total, cartItem) => total + cartItem.cartQuantity, 0),
    );

    setToast(`${item.name} added to your basket`);

    window.setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <main className="home-page">
      <SiteNav />

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              <span className="eyebrow-dot" />
              GOOD FOOD · LESS WASTE
            </span>

            <h1>
              Great food.
              <br />
              <em>Second chance.</em>
            </h1>

            <p className="home-hero-description">
              Discover delicious surplus food from cafés, bakeries, restaurants
              and local shops — at a better price.
            </p>

            <form
              className="home-search"
              onSubmit={(event) => {
                event.preventDefault();

                router.push(`/discover?search=${encodeURIComponent(query)}`);
              }}
            >
              <Search size={19} />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you craving?"
                aria-label="Search food"
              />

              <button type="submit">
                Find food
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="home-hero-points">
              <span>✓ Up to 70% off</span>
              <span>✓ Local pickup</span>
              <span>✓ Less food wasted</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-green-orb" />
            <div className="hero-small-orb" />

            <div className="hero-plate">
              <div className="hero-food">
                <span className="food-lettuce">🥬</span>
                <span className="food-carrot">🥕</span>
                <span className="food-bread">🥖</span>
                <span className="food-tomato">🍅</span>
                <span className="food-herb">🌿</span>
              </div>
            </div>

            <div className="hero-deal-card">
              <div className="deal-icon">%</div>

              <div>
                <strong>60% off</strong>
                <span>good food today</span>
              </div>
            </div>

            <div className="hero-location-card">
              <MapPin size={15} />
              <div>
                <strong>Nearby</strong>
                <span>Fresh picks around you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BENEFITS */}
      <section className="quick-benefits">
        <div>
          <span>01</span>
          <div>
            <strong>Discover</strong>
            <p>Find surplus food near you.</p>
          </div>
        </div>

        <div>
          <span>02</span>
          <div>
            <strong>Reserve</strong>
            <p>Grab it before it goes.</p>
          </div>
        </div>

        <div>
          <span>03</span>
          <div>
            <strong>Enjoy</strong>
            <p>Save money and reduce waste.</p>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="home-market">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">THE MARKETPLACE</span>

            <h2>
              Good food,
              <br />
              <em>going fast.</em>
            </h2>

            <p>Today's surplus picks from local businesses.</p>
          </div>

          <Link href="/discover" className="view-all-link">
            Explore all food
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="market-categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="market-loading">
            <span />
            <span />
            <span />
          </div>
        )}

        {isError && (
          <div className="market-message">
            We couldn't load the latest listings. Showing available food
            instead.
          </div>
        )}

        {!isLoading && (
          <>
            <div className="home-food-grid">
              {filtered.slice(0, 6).map((item, index) => (
                <article className="home-food-card" key={item.id}>
                  <Link
                    href={`/food/${item.id}`}
                    className={`home-food-image image-${index % 6}`}
                  >
                    {item.image?.startsWith("data:image/") ? (
                      <span
                        className="home-real-image"
                        style={{
                          backgroundImage: `url(${item.image})`,
                        }}
                      />
                    ) : (
                      <span className="home-emoji">{item.image || "🍽️"}</span>
                    )}

                    {item.featured && (
                      <span className="featured-badge">Best value</span>
                    )}

                    <span className="nearby-badge">{item.distance}</span>
                  </Link>

                  <button
                    className={`home-heart ${
                      favorites.includes(item.id) ? "active" : ""
                    }`}
                    onClick={() => toggleFavorite(item.id)}
                    aria-label="Favorite"
                  >
                    <Heart
                      size={17}
                      fill={
                        favorites.includes(item.id) ? "currentColor" : "none"
                      }
                    />
                  </button>

                  <div className="home-food-body">
                    <span className="home-food-category">{item.type}</span>

                    <Link href={`/food/${item.id}`} className="home-food-name">
                      {item.name}
                    </Link>

                    <p className="home-food-shop">{item.shop}</p>

                    <div className="home-food-pickup">
                      <span>Pickup</span>
                      <strong>{item.pickup}</strong>
                      <i />
                      <span>{item.quantity} left</span>
                    </div>

                    <div className="home-food-footer">
                      <div>
                        <strong>${item.price.toFixed(2)}</strong>
                        <del>${item.was.toFixed(2)}</del>
                      </div>

                      {session?.user.role === "customer" && (
                        <button
                          className="add-button"
                          onClick={() => addToCart(item)}
                        >
                          Add
                          <span>+</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!filtered.length && (
              <div className="market-message">
                No food matches that search. Try another craving.
              </div>
            )}
          </>
        )}

        <Link href="/discover" className="mobile-market-link">
          See all available food
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* WHY PLATEFUL */}
      <section className="why-section">
        <div className="why-content">
          <span className="home-eyebrow">WHY PLATEFUL</span>

          <h2>
            Surplus doesnt mean
            <br />
            <em>second best.</em>
          </h2>

          <p>
            Every day, perfectly good food goes unsold simply because the timing
            isnt right. Plateful gives that food another destination — your
            table.
          </p>

          <Link href="/how-it-works" className="dark-button">
            How it works
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="why-stats">
          <div className="why-stat">
            <span>01</span>
            <strong>Save money</strong>
            <p>Great local food without the full-price bill.</p>
          </div>

          <div className="why-stat">
            <span>02</span>
            <strong>Support local</strong>
            <p>Discover businesses and favourites around you.</p>
          </div>

          <div className="why-stat">
            <span>03</span>
            <strong>Waste less</strong>
            <p>Give good food another chance instead of a landfill.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-final">
        <div>
          <span className="home-eyebrow">YOUR NEXT MEAL IS WAITING</span>

          <h2>
            Eat well.
            <br />
            <em>Waste less.</em>
          </h2>
        </div>

        <Link href="/discover" className="final-button">
          Start discovering
          <ArrowRight size={17} />
        </Link>
      </section>

      {toast && (
        <div className="market-toast">
          <div>✓</div>
          <span>{toast}</span>
        </div>
      )}
    </main>
  );
}
