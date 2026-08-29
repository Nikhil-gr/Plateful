export type MarketplaceItem = {
  id: string;
  name: string;
  shop: string;
  type: string;
  price: number;
  was: number;
  pickup: string;
  quantity: number;
  distance: string;
  image: string;
  description: string;
  featured?: boolean;
};

export const demoListings: MarketplaceItem[] = [
  {
    id: "demo-bakery",
    name: "Sunset Bakery Box",
    shop: "Hearth & Grain",
    type: "Bakery",
    price: 4.5,
    was: 12,
    pickup: "Today · 7:00 – 8:00 PM",
    quantity: 3,
    distance: "0.4 mi",
    image: "🥐",
    description:
      "A generous surprise box of breads, pastries, and sweet treats baked fresh today.",
    featured: true,
  },
  {
    id: "demo-veggie",
    name: "Seasonal Veggie Bowl",
    shop: "Sprout Kitchen",
    type: "Meals",
    price: 5,
    was: 13,
    pickup: "Today · 6:30 – 7:30 PM",
    quantity: 4,
    distance: "0.8 mi",
    image: "🥗",
    description:
      "A colourful, ready-to-enjoy seasonal bowl made from today’s kitchen surplus.",
  },
  {
    id: "demo-pizza",
    name: "Pizza Night Bundle",
    shop: "Forno Rosso",
    type: "Meals",
    price: 6,
    was: 16,
    pickup: "Today · 8:15 – 9:00 PM",
    quantity: 2,
    distance: "1.2 mi",
    image: "🍕",
    description:
      "A comforting pizza bundle, perfect for an easy dinner with less waste.",
  },
  {
    id: "demo-brunch",
    name: "Garden Brunch Bag",
    shop: "Common Grounds",
    type: "Café",
    price: 5.5,
    was: 14,
    pickup: "Tomorrow · 8:00 – 9:30 AM",
    quantity: 5,
    distance: "0.6 mi",
    image: "🥪",
    description:
      "Fresh sandwiches, a baked treat, and café favourites waiting for tomorrow morning.",
  },
  {
    id: "demo-treats",
    name: "Sweet Treats Box",
    shop: "Mallow & Co.",
    type: "Desserts",
    price: 4,
    was: 10,
    pickup: "Today · 7:30 – 8:30 PM",
    quantity: 3,
    distance: "1.5 mi",
    image: "🧁",
    description:
      "A little box of handcrafted desserts that deserve a second chance.",
  },
  {
    id: "demo-produce",
    name: "Market Produce Bag",
    shop: "The Green Grocer",
    type: "Groceries",
    price: 3.5,
    was: 9,
    pickup: "Today · 6:00 – 8:00 PM",
    quantity: 6,
    distance: "0.9 mi",
    image: "🥕",
    description:
      "A practical mixed bag of seasonal fruit and vegetables from the market.",
  },
];

export const categories = [
  "All",
  "Bakery",
  "Meals",
  "Café",
  "Desserts",
  "Groceries",
];
