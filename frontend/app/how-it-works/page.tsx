import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Store,
  Heart,
  Leaf,
  Clock3,
  BadgeCheck,
} from "lucide-react";

import { SiteNav } from "../../components/SiteNav";

export default function HowItWorks() {
  return (
    <main className="info-page how-page">
      <SiteNav />

      {/* HERO */}
      <section className="info-hero how-hero">
        <div className="info-hero-copy">
          <span className="info-eyebrow">SIMPLE BY DESIGN</span>

          <h1>
            Good food deserves
            <br />
            <em>a second plan.</em>
          </h1>

          <p>
            Plateful makes saving surplus food simple. Discover what's nearby,
            choose something delicious, reserve it, and pick it up when it suits
            you.
          </p>

          <Link href="/discover" className="info-dark-button">
            Discover food
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="how-hero-visual">
          <div className="how-circle" />

          <div className="how-card main-card">
            <div className="how-card-icon">
              <ShoppingBag size={22} />
            </div>

            <div>
              <small>Your rescued meal</small>
              <strong>Fresh bakery bag</strong>
              <span>$5.50 · 60% saved</span>
            </div>
          </div>

          <div className="how-floating-card">
            <Leaf size={18} />
            <div>
              <strong>Less waste</strong>
              <span>One meal at a time</span>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="how-steps-section">
        <div className="info-section-heading">
          <span className="info-eyebrow">THREE SIMPLE STEPS</span>

          <h2>
            From surplus
            <br />
            <em>to supper.</em>
          </h2>
        </div>

        <div className="how-steps">
          <article>
            <div className="step-number">01</div>
            <div className="step-icon">
              <Search size={24} />
            </div>

            <span>DISCOVER</span>
            <h3>Find something good.</h3>

            <p>
              Browse surplus food from cafés, bakeries, restaurants, grocers and
              other local favourites.
            </p>
          </article>

          <article>
            <div className="step-number">02</div>
            <div className="step-icon">
              <ShoppingBag size={24} />
            </div>

            <span>RESERVE</span>
            <h3>Pick your bag.</h3>

            <p>
              Check the price, pickup time and availability, then add what you
              want to your basket.
            </p>
          </article>

          <article>
            <div className="step-number">03</div>
            <div className="step-icon">
              <Heart size={24} />
            </div>

            <span>ENJOY</span>
            <h3>Collect and enjoy.</h3>

            <p>
              Pick up your order, enjoy something delicious, and know that
              perfectly good food found another home.
            </p>
          </article>
        </div>
      </section>

      {/* FOR BOTH SIDES */}
      <section className="how-two-sides">
        <div className="side-card shopper-side">
          <span className="side-icon">
            <ShoppingBag size={21} />
          </span>

          <span className="info-eyebrow">FOR FOOD LOVERS</span>

          <h2>Good food for less.</h2>

          <p>
            Discover affordable meals, hidden neighbourhood favourites, and
            last-minute treats while helping local businesses sell what they
            already made.
          </p>

          <Link href="/discover">
            Start shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="side-card business-side">
          <span className="side-icon">
            <Store size={21} />
          </span>

          <span className="info-eyebrow">FOR BUSINESSES</span>

          <h2>Turn surplus into value.</h2>

          <p>
            Put unsold food in front of nearby customers instead of letting it
            go to waste. Recover revenue and bring people through your door.
          </p>

          <Link href="/account">
            Join as a business
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* WHY */}
      <section className="how-why">
        <div>
          <span className="info-eyebrow">WHY IT MATTERS</span>

          <h2>
            Surplus is about
            <br />
            <em>timing, not quality.</em>
          </h2>
        </div>

        <div className="how-why-copy">
          <p>
            A bakery can have perfectly fresh bread left at the end of the day.
            A café can have sandwiches that didn't sell. A restaurant can have
            prepared food that deserves a home.
          </p>

          <p>Plateful simply connects that food with people who want it.</p>

          <div className="why-mini-grid">
            <div>
              <Clock3 size={18} />
              <strong>Right time</strong>
              <span>Pickup when it works for you.</span>
            </div>

            <div>
              <BadgeCheck size={18} />
              <strong>Good value</strong>
              <span>Great food at surplus prices.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="info-final-cta">
        <span className="info-eyebrow">READY?</span>

        <h2>
          Your next good meal
          <br />
          might already exist.
        </h2>

        <Link href="/discover" className="info-dark-button">
          Discover food
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
