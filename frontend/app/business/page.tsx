"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, authHeaders } from "../../lib/api";
import { FoodListing, ListingsResponse } from "../../types/listing";
import { clearSession } from "../../lib/auth";
import { useRoleGuard } from "../../hooks/useRoleGuard";

type Order = {
  _id: string;
  status: "pending" | "confirmed" | "ready_for_pickup" | "completed" | "cancelled";
  totalAmount: number;
  pickupTime: string;
  items: Array<{ quantity: number; listing?: { name: string } | null }>;
};

const statusLabel = (status: string) => status.replaceAll("_", " ");

export default function BusinessPage() {
  const router = useRouter();
  const authorized = useRoleGuard("business");
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Log in with a business account to manage surplus food.");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const headers = authHeaders();
      const [listingsResponse, nextOrders] = await Promise.all([
        api.get<ListingsResponse>("/listings/mine", { headers }),
        api.get<Order[]>("/orders/mine", { headers }),
      ]);
      setListings(listingsResponse.listings);
      setOrders(nextOrders);
      setMessage("Your live marketplace activity is up to date.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the business dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    const timer = window.setTimeout(() => void loadDashboard(false), 0);
    return () => window.clearTimeout(timer);
  }, [authorized, loadDashboard]);

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setMessage("Use a PNG, JPG, or WebP image.");
      event.currentTarget.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Use an image smaller than 1 MB.");
      event.currentTarget.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await api.post("/listings", {
          name: form.get("name"), description: form.get("description"),
          category: form.get("category"), originalPrice: Number(form.get("originalPrice")),
          surplusPrice: Number(form.get("surplusPrice")), quantity: Number(form.get("quantity")),
          pickupLocation: form.get("pickupLocation"), pickupTime: form.get("pickupTime"),
          availableUntil: new Date(form.get("availableUntil") as string).toISOString(),
          ...(image ? { image } : {}),
        }, { headers: authHeaders() });
      formElement.reset();
      setImage("");
      setMessage("Listing published and visible to customers.");
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not publish listing");
    }
  };

  const updateListing = async (id: string, status: "active" | "sold_out" | "expired") => {
    try {
      await api.patch(`/listings/${id}`, { status }, { headers: authHeaders() });
      setMessage(`Listing marked ${statusLabel(status)}.`);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update listing");
    }
  };

  const deleteListing = async (id: string) => {
    if (!window.confirm("Permanently delete this listing? Existing orders will retain their history.")) return;
    try {
      await api.delete(`/listings/${id}`, { headers: authHeaders() });
      setMessage("Listing deleted.");
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete listing");
    }
  };

  const updateOrder = async (id: string, status: Order["status"]) => {
    try {
      await api.patch(`/orders/${id}/status`, { status }, { headers: authHeaders() });
      setMessage(`Order marked ${statusLabel(status)}.`);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update order");
    }
  };

  if (!authorized) return <main className="portal" />;

  return (
    <main className="portal">
      <Link className="brand" href="/"><span>p</span> plateful</Link>
      <button className="sign-out" onClick={() => { clearSession(); router.replace("/"); }}>Sign out</button>
      <section className="dashboard business-dashboard">
        <p className="eyebrow">Business dashboard</p>
        <h1>Turn today’s surplus into tomorrow’s impact.</h1>
        <form className="listing-form" onSubmit={submit}>
          <input required name="name" placeholder="Food listing name" />
          <textarea required name="description" placeholder="Short description" />
          <label className="image-upload">
            <span>Food photo <small>PNG, JPG, or WebP · max 1 MB</small></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} />
            {image && <span className="upload-preview" style={{ backgroundImage: `url(${image})` }} />}
          </label>
          <select name="category"><option>Bakery</option><option>Meals</option><option>Café</option><option>Groceries</option></select>
          <input required name="originalPrice" type="number" min="0.01" step="0.01" placeholder="Original price" />
          <input required name="surplusPrice" type="number" min="0.01" step="0.01" placeholder="Surplus price" />
          <input required name="quantity" type="number" min="1" step="1" placeholder="Available quantity" />
          <input required name="pickupLocation" placeholder="Pickup location" />
          <input required name="pickupTime" placeholder="Pickup time" />
          <input required name="availableUntil" type="datetime-local" />
          <button>Publish listing</button>
        </form>
        <p className="form-message">{message}</p>

        <div className="dashboard-heading"><h2>Your listings</h2><button className="secondary" onClick={() => void loadDashboard()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></div>
        <div className="management-list">
          {listings.length ? listings.map((listing) => (
            <article key={listing._id}>
              <div><b>{listing.name}</b><span>{listing.quantity} left · {statusLabel(listing.status ?? "active")} · until {new Date(listing.availableUntil).toLocaleString()}</span></div>
              <div className="management-actions">
                {listing.status !== "active" && <button onClick={() => void updateListing(listing._id, "active")}>Activate</button>}
                {listing.status === "active" && <button onClick={() => void updateListing(listing._id, "sold_out")}>Sold out</button>}
                <button onClick={() => void updateListing(listing._id, "expired")}>End</button>
                <button className="danger" onClick={() => void deleteListing(listing._id)}>Delete</button>
              </div>
            </article>
          )) : <p className="empty">No listings yet. Publish your first surplus bag above.</p>}
        </div>

        <div className="dashboard-heading"><h2>Incoming orders</h2></div>
        <div className="management-list">
          {orders.length ? orders.map((order) => (
            <article key={order._id}>
              <div><b>${order.totalAmount.toFixed(2)} · {statusLabel(order.status)}</b><span>{order.items.map((item) => `${item.quantity}× ${item.listing?.name ?? "Deleted listing"}`).join(", ")} · Pickup: {order.pickupTime}</span></div>
              <div className="management-actions">
                {order.status === "pending" && <button onClick={() => void updateOrder(order._id, "confirmed")}>Confirm</button>}
                {order.status === "confirmed" && <button onClick={() => void updateOrder(order._id, "ready_for_pickup")}>Ready</button>}
                {order.status === "ready_for_pickup" && <button onClick={() => void updateOrder(order._id, "completed")}>Complete</button>}
                {!["completed", "cancelled"].includes(order.status) && <button className="danger" onClick={() => void updateOrder(order._id, "cancelled")}>Cancel</button>}
              </div>
            </article>
          )) : <p className="empty">New customer reservations will appear here.</p>}
        </div>
      </section>
    </main>
  );
}
