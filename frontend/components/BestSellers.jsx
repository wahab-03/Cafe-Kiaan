"use client";
import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const fallbackItems = [
  { id: "fallback-shrimp", name: "Torpedo Shrimps", price: 490, category: "Finger Foods", description: "Crispy torpedo shrimps served with a delicious dip.", image: "/images/torpedo-shrimps.png", featured: true },
  { id: "fallback-burger", name: "Chicken Burger", price: 360, category: "Burgers", description: "Crispy chicken fillet, lettuce, cheese and house sauce.", image: "/images/chicken-burger.png", featured: true },
  { id: "fallback-pizza", name: "Signature Pizza", price: 650, category: "Pizza", description: "Loaded signature pizza with chicken, vegetables and mozzarella.", image: "/images/signature-pizza.png", featured: true },
  { id: "fallback-latte", name: "Café Latte", price: 290, category: "Coffee", description: "Smooth espresso with steamed milk and delicate foam.", image: "/images/cafe-latte.png", featured: true }
];

export default function BestSellers() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    api.menu().then(data => {
      if (!active) return;
      const featured = Array.isArray(data) ? data.filter(i => i.featured).slice(0, 4) : [];
      setItems(featured.length === 4 ? featured : (Array.isArray(data) && data.length ? data.slice(0, 4) : fallbackItems));
    }).catch(() => { if (active) setItems(fallbackItems); });
    return () => { active = false };
  });

  return (
    <section className="bg-[#FFF9F6] py-14 sm:py-16">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <SectionHeading title="Kiaan Best Sellers" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map(item => <ProductCard key={item.id} item={item} onQuickView={setSelected} onAdd={addItem} />)}
        </div>
      </div>
      <QuickView item={selected} onClose={() => setSelected(null)} onAdd={addItem} />
    </section>
  );
}
