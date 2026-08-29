export type Listing = {
  _id: string;
  name: string;
  businessName: string;
  category: string;
  originalPrice: number;
  surplusPrice: number;
  quantity: number;
  pickupLocation: string;
  pickupTime: string;
  availableUntil: string;
  status?: "active" | "sold_out" | "expired";
};

export type CartItem = Pick<
  Listing,
  "_id" | "name" | "businessName" | "surplusPrice" | "pickupTime" | "quantity"
> & {
  cartQuantity: number;
};

const CART_KEY = "plateful_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(value) ? (value as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(listing: Listing): CartItem[] {
  const cart = getCart();
  const existing = cart.find((item) => item._id === listing._id);
  const next = existing
    ? cart.map((item) =>
        item._id === listing._id
          ? {
              ...item,
              cartQuantity: Math.min(item.cartQuantity + 1, listing.quantity),
            }
          : item,
      )
    : [
        ...cart,
        {
          _id: listing._id,
          name: listing.name,
          businessName: listing.businessName,
          surplusPrice: listing.surplusPrice,
          pickupTime: listing.pickupTime,
          quantity: listing.quantity,
          cartQuantity: 1,
        },
      ];
  saveCart(next);
  return next;
}
