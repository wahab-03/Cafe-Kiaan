"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sandwich, UtensilsCrossed, Utensils, Coffee, ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { api } from "../lib/api";

const HOME_CATEGORIES = ["Coffee", "Paninis & Sandwiches", "Small Plates", "Rice & Salads", "Bakery"];

const fallbackCats = [
  ["Coffee", Coffee],
  ["Paninis & Sandwiches", Sandwich],
  ["Small Plates", Utensils],
  ["Rice & Salads", UtensilsCrossed],
  ["Bakery", UtensilsCrossed],
];

const iconByCategory = {
  coffee: Coffee,
  "paninis & sandwiches": Sandwich,
  "small plates": Utensils,
};

function arrangeCategories(names) {
  const has = (wanted) => names.some((name) => String(name).trim().toLowerCase() === wanted.toLowerCase());
  return HOME_CATEGORIES.filter(has);
}

export default function MenuCategories() {
  const [visible, setVisible] = useState(() => fallbackCats.map(([name]) => name));

  useEffect(() => {
    let active = true;

    api.categories()
      .then((data) => {
        if (!active) return;
        setVisible(Array.isArray(data) ? arrangeCategories(data.filter((name) => typeof name === "string" && name.trim())) : []);
      })
      .catch(() => {
        if (active) setVisible(fallbackCats.map(([name]) => name));
      });

    return () => {
      active = false;
    };
  }, []);

  const itemWidth = visible.length > 6 ? "lg:w-[calc((100%_-_60px)/4)]" : visible.length === 5 ? "lg:w-[calc((100%_-_80px)/5)]" : "lg:w-[calc((100%_-_100px)/6)]";

  return (
    <section id="menu" className="bg-[#FFF9F6]">
      <div className="site-container py-8 sm:py-10">
        <SectionHeading title="Explore Our Menu" />
        <div className="flex flex-wrap justify-center gap-5">
          {visible.map((name) => {
            const Icon = iconByCategory[String(name).toLowerCase()] || UtensilsCrossed;
            return (
              <Link key={name} href={`/menu?category=${encodeURIComponent(name)}`} className={`group flex w-[calc(50%_-_10px)] flex-col items-center gap-3 sm:w-[calc((100%_-_40px)/3)] ${itemWidth} rounded-2xl border border-[#E9D7D2] bg-[#FBF6F2] px-4 py-8 shadow-[0_2px_8px_rgba(90,50,35,0.05)] transition-all hover:-translate-y-1 hover:border-kiaan-pink hover:shadow-kiaan`}>
                <span className="grid size-16 place-items-center rounded-full bg-white text-kiaan-pink transition-colors group-hover:bg-kiaan-pink group-hover:text-white"><Icon size={27}/></span>
                <span className="text-lg font-semibold text-kiaan-ink">{name}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/menu" className="flex items-center gap-2 rounded-full bg-kiaan-pink px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-kiaan-deep">
            View Full Menu <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </section>
  );
}
