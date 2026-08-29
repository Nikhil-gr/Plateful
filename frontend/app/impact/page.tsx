import Link from "next/link";
import { SiteNav } from "../../components/SiteNav";
export default function Impact() {
  return (
    <main className="info-page">
      <SiteNav />
      <section className="story-hero impact-hero">
        <p className="eyebrow">More than a good deal</p>
        <h1>
          Every pickup has
          <br />
          <i>a positive ripple.</i>
        </h1>
        <p>
          We give surplus food a second chance—helping customers spend less,
          businesses recover value, and communities waste less.
        </p>
      </section>
      <section className="impact-dashboard">
        <article>
          <b>100+</b>
          <span>meals</span>
        </article>
        <article>
          <b>1k+</b>
          <span>customers</span>
        </article>
        <article>
          <b>64</b>
          <span>local food partners</span>
        </article>
        <article>
          <b>21</b>
          <span>neighbourhoods reached</span>
        </article>
      </section>
      <section className="impact-flow">
        <p className="eyebrow">How it works</p>
        <h2>
          Business surplus <span>→</span> Plateful <span>→</span> your table
        </h2>
        <p>
          When edible food gets a new home instead of a bin, everyone gets
          something better: a meal, extra income, and a lighter footprint.
        </p>
      </section>
      <section className="benefit-section impact-benefits">
        <article>
          <span>♲</span>
          <h2>Less food wasted</h2>
          <p>
            Making better use of food already produced is one of the simplest
            sustainable choices we can make.
          </p>
        </article>
        <article>
          <span>♥</span>
          <h2>More community value</h2>
          <p>
            Affordable food helps households stretch budgets and keeps local
            food businesses connected to their neighbours.
          </p>
        </article>
      </section>
      <section className="end-cta">
        <p className="eyebrow">Make your next meal count</p>
        <h2>Delicious for you. Better for the planet.</h2>
        <Link className="big-cta" href="/discover">
          Discover available food →
        </Link>
      </section>
    </main>
  );
}
