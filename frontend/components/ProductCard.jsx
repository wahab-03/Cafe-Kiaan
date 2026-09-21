"use client";
import { ShoppingCart } from "lucide-react";
import { resolveMenuImage } from "../lib/menu-images";

export default function ProductCard({item,onQuickView,onAdd}){
  const displayItem = {...item, image: resolveMenuImage(item)};
  return <article className="group overflow-hidden rounded-2xl border border-[#E9D7D2] bg-[#FBF6F2] shadow-[0_2px_8px_rgba(90,50,35,0.04)] transition-shadow hover:shadow-kiaan cursor-pointer" onClick={()=>onQuickView(displayItem)}>
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={resolveMenuImage(item)} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" data-fallback={displayItem.fallback_image || "/images/kiaan-hero.jpg"} onError={(e)=>{const fallback=e.currentTarget.dataset.fallback || "/images/kiaan-hero.jpg"; if(e.currentTarget.src!==fallback)e.currentTarget.src=fallback;}}/>
      {item.featured && <span className="absolute top-3 left-3 bg-kiaan-pink text-white text-[12px] font-bold px-2.5 py-1 rounded-full">BEST SELLER</span>}
    </div>
    <div className="p-4 text-center">
      <h3 className="font-semibold text-kiaan-ink text-lg sm:text-xl leading-snug break-words">{item.name}</h3>
      <p className="mt-1 font-serif text-xl font-bold text-kiaan-pink">৳{item.price}</p>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-8">{item.description}</p>
      <button
        onClick={e=>{e.stopPropagation();onAdd(displayItem)}}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-kiaan-pink px-4 py-2 text-sm font-semibold uppercase tracking-wide text-kiaan-pink transition-colors hover:bg-kiaan-pink hover:text-white"
      >
        <ShoppingCart size={14}/> Add to Cart
      </button>
    </div>
  </article>;
}
