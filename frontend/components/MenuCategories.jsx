"use client";

import Link from "next/link";
import { Drumstick, Sandwich, Pizza, UtensilsCrossed, Fish, Coffee, ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const fallbackCats = [
  ["Finger Foods", Drumstick],
  ["Burgers", Sandwich],
  ["Pizza", Pizza],
  ["Pasta", UtensilsCrossed],
  ["Seafood", Fish],
  ["Coffee", Coffee],
];

const iconByCategory = {
  "finger foods": Drumstick,
  burgers: Sandwich,
  pizza: Pizza,
  pasta: UtensilsCrossed,
  seafood: Fish,
  coffee: Coffee,
};

export default function MenuCategories() {
  
  const visible = fallbackCats.map(([name]) => name);
  const gridCols = visible.length > 6 ? "lg:grid-cols-4" : "lg:grid-cols-6";

  return (
    <section id="menu" className="bg-[#FFF9F6]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
        <SectionHeading title="Explore Our Menu" />
        <div className={`grid grid-cols-2 gap-5 sm:grid-cols-3 ${gridCols}`}>
          {visible.map((name) => {
            const Icon = iconByCategory[String(name).toLowerCase()] || UtensilsCrossed;
            return (
              <Link key={name} href={`/menu?category=${encodeURIComponent(name)}`} className="group flex flex-col items-center gap-3 rounded-2xl border border-[#E9D7D2] bg-[#FBF6F2] px-4 py-8 shadow-[0_2px_8px_rgba(90,50,35,0.05)] transition-all hover:-translate-y-1 hover:border-kiaan-pink hover:shadow-kiaan">
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
