"use client";
import {X,Minus,Plus,ShoppingBag} from "lucide-react";
import {useState} from "react";

export default function QuickView({item,onClose,onAdd}){
  const [qty,setQty]=useState(1);
  if(!item) return null;
  return <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
    <aside className="absolute right-0 top-0 h-full w-full sm:w-[430px] bg-white shadow-2xl overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="relative h-72">
        <img src={item.image || "/images/kiaan-hero.jpg"} alt={item.name} className="h-full w-full object-cover" data-fallback={item.fallback_image || "/images/kiaan-hero.jpg"} onError={(e)=>{const fallback=e.currentTarget.dataset.fallback || "/images/kiaan-hero.jpg"; if(e.currentTarget.src!==fallback)e.currentTarget.src=fallback;}}/>
        <button onClick={onClose} className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow"><X size={18}/></button>
      </div>
      <div className="p-7">
        <p className="text-kiaan-pink text-[10px] tracking-[.2em] font-bold uppercase">{item.category}</p>
        <h2 className="font-serif text-3xl font-bold mt-2">{item.name}</h2>
        <div className="text-kiaan-pink text-xl font-bold mt-3">৳{item.price}</div>
        <p className="text-gray-600 leading-7 mt-5">{item.description}</p>
        <div className="mt-7 flex items-center justify-between border-y py-5">
          <span className="font-semibold">Quantity</span>
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full border flex items-center justify-center" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={14}/></button>
            <span className="font-bold">{qty}</span>
            <button className="w-9 h-9 rounded-full border flex items-center justify-center" onClick={()=>setQty(qty+1)}><Plus size={14}/></button>
          </div>
        </div>
        <button onClick={()=>{onAdd(item,qty);onClose()}} className="mt-6 w-full bg-kiaan-pink text-white rounded-full py-4 font-bold flex items-center justify-center gap-2"><ShoppingBag size={18}/> ADD TO CART • ৳{item.price*qty}</button>
      </div>
    </aside>
  </div>;
}
