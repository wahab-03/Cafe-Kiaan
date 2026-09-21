"use client";
import {Suspense, useEffect,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import {Search,Loader2} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import QuickView from "../../components/QuickView";
import {api} from "../../lib/api";
import {useCart} from "../../context/CartContext";
import Link from "next/link";

const defaults=["All"];

function MenuContent(){
  const params=useSearchParams();
  const [category,setCategory]=useState(params.get("category")||"All");
  const [categories,setCategories]=useState(defaults);
  const [items,setItems]=useState([]);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(null);
  const {addItem}=useCart();

  useEffect(()=>{
    api.categories().then(data=>{
      const names=Array.isArray(data)?data.filter(Boolean):[];
      setCategories(["All",...names.filter(x=>x.toLowerCase()!=="all")]);
    }).catch(()=>setCategories(defaults));
  },[]);

  useEffect(()=>{
    let active=true; setLoading(true); setError("");
    const req=category==="All"?api.menu():api.category(category);
    req.then(data=>{if(active)setItems(data)})
      .catch(e=>{if(active)setError(e.message||"Unable to load menu. Please try again.")})
      .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[category]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return q?items.filter(x=>`${x.name} ${x.description} ${x.category}`.toLowerCase().includes(q)):items;
  },[items,search]);

  return <><Header/>
    <main>
      <section className="bg-kiaan-pink text-white py-12 sm:py-14"><div className="max-w-[1600px] mx-auto px-5 text-center"><p className="text-xs tracking-[.25em] font-bold">CAFÉ KIAAN</p><h1 className="font-serif text-4xl sm:text-5xl font-bold mt-2">Explore Our Menu</h1><p className="text-sm text-white/80 mt-3">Fresh food, comforting coffee and favourites for every moment.</p></div></section>
      <section className="py-10 sm:py-12 bg-kiaan-cream min-h-[700px]"><div className="max-w-[1600px] mx-auto px-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">{categories.map(cat=><button key={cat} onClick={()=>setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold border ${category===cat?"bg-kiaan-pink text-white border-kiaan-pink":"bg-white text-gray-700 border-pink-100 hover:border-kiaan-pink"}`}>{cat}</button>)}</div>
          <div className="relative w-full lg:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search menu..." className="w-full pl-9 pr-4 py-2.5 rounded-full border border-pink-100 bg-white text-sm outline-none"/></div>
        </div>
        <div className="mt-8">
          {loading&&<div className="py-24 text-center text-gray-500"><Loader2 className="animate-spin mx-auto text-kiaan-pink" size={30}/><p className="mt-3 text-sm">Loading menu...</p></div>}
          {!loading&&error&&<div className="bg-white border border-red-100 rounded-2xl p-8 text-center"><h2 className="font-serif text-xl font-bold">Unable to load menu</h2><p className="text-sm text-gray-500 mt-2">{error}</p><p className="text-xs text-gray-400 mt-3">Make sure the configured Café Kiaan backend is running and the menu has been seeded.</p></div>}
          {!loading&&!error&&!filtered.length&&<div className="bg-white border border-pink-100 rounded-2xl p-10 text-center"><h2 className="font-serif text-xl font-bold">No items are currently available</h2><p className="text-sm text-gray-500 mt-2">Try another category or search term.</p><Link href="/menu" className="inline-block mt-5 text-kiaan-pink text-xs font-bold">VIEW ALL ITEMS →</Link></div>}
          {!loading&&!error&&filtered.length>0&&<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{filtered.map(item=><ProductCard key={item.id} item={item} onQuickView={setSelected} onAdd={addItem}/>)}</div>}
        </div>
      </div></section>
    </main>
    <Footer/><QuickView item={selected} onClose={()=>setSelected(null)} onAdd={addItem}/>
  </>;
}

export default function MenuPage(){
  return <Suspense fallback={<><Header/><main className="min-h-[650px] bg-kiaan-cream"/><Footer/></>}><MenuContent/></Suspense>;
}
