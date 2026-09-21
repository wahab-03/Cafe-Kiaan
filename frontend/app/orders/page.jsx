"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, ReceiptText } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const statusLabels = { PENDING:"Pending", CONFIRMED:"Confirmed", PREPARING:"Preparing", READY:"Ready", OUT_FOR_DELIVERY:"Out for Delivery", COMPLETED:"Completed", CANCELLED:"Cancelled" };

function formatDate(value) {
  if (!value) return "Date unavailable";
  const normalized = String(value).includes("T") ? String(value) : String(value).replace(" ", "T");
  const date = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-BD", { day:"numeric", month:"short", year:"numeric", hour:"numeric", minute:"2-digit" }).format(date);
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders,setOrders]=useState([]), [loading,setLoading]=useState(true), [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;
    let timer=null;
    let loadingRequest=false;

    async function load(){
      try{
        const saved=localStorage.getItem("kiaan-customer");
        const customer=saved?JSON.parse(saved):null;
        if(!customer?.customerToken){
          if(active) router.replace("/account?next=/orders");
          return;
        }
        const result=await api.customerOrders(customer.customerToken);
        if(active){setOrders(Array.isArray(result.orders)?result.orders:[]);setMessage("");}
      }catch(error){ if(active)setMessage(error.message||"Could not load your order history."); }
      finally{ if(active)setLoading(false); loadingRequest=false; }
    }

    const poll=()=>{
      if(!loadingRequest){ loadingRequest=true; load(); }
    };

    poll();
    timer=window.setInterval(poll,3000);
    return ()=>{
      active=false;
      if(timer) window.clearInterval(timer);
    };
  },[router]);

  const combinedTotal=useMemo(()=>orders.reduce((sum,order)=>sum+Number(order.total||0),0),[orders]);

  return <>
    <Header/>
    <main className="min-h-[700px] bg-kiaan-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-kiaan-pink text-xs font-bold tracking-[0.25em]">YOUR ORDERS</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="font-serif text-4xl font-bold text-kiaan-ink sm:text-5xl">Order History</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">Every checkout stays as its own order, with its own bill and live status.</p></div>
          <Link href="/menu" className="inline-flex items-center gap-2 rounded-full bg-kiaan-pink px-5 py-2.5 text-sm font-semibold text-white hover:bg-kiaan-deep">Order More <ArrowRight size={15}/></Link>
        </div>
        {loading&&<div className="mt-8 rounded-3xl bg-white p-10 text-center text-sm text-gray-500">Loading your orders...</div>}
        {!loading&&message&&!orders.length&&<div className="mt-8 rounded-3xl border border-pink-100 bg-white p-10 text-center"><ReceiptText className="mx-auto text-kiaan-pink" size={38}/><p className="mt-4 text-sm leading-7 text-gray-500">{message}</p><Link href="/menu" className="mt-5 inline-flex rounded-full bg-kiaan-pink px-6 py-3 text-xs font-bold text-white">EXPLORE MENU</Link></div>}
        {!loading&&orders.length>0&&<div className="mt-8 space-y-6">
          {orders.map(order=><article key={order.id} className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Order ID</p><h2 className="mt-1 font-serif text-2xl font-bold text-kiaan-ink">{order.name}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400"><Clock3 size={13}/> {formatDate(order.created_at)}</p></div>
              <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Order Total</p><p className="mt-1 text-2xl font-bold text-kiaan-pink">৳{Number(order.total||0).toFixed(2)}</p><span className="mt-2 inline-flex rounded-full bg-kiaan-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-kiaan-pink">{statusLabels[order.status]||order.status}</span></div>
            </div>
            <div className="mt-5 space-y-3">{order.items.map((item,index)=><div key={`${order.id}-${item.menu_item_id}-${index}`} className="flex items-center justify-between gap-4 rounded-xl bg-kiaan-cream/60 px-4 py-3 text-sm"><div className="min-w-0"><p className="font-semibold text-gray-800 break-words">{item.name}</p><p className="mt-0.5 text-xs text-gray-500">৳{Number(item.price||0).toFixed(2)} × {item.quantity}</p></div><b className="shrink-0 text-gray-800">৳{Number(item.line_total??(Number(item.price||0)*Number(item.quantity||0))).toFixed(2)}</b></div>)}</div>
            <div className="mt-5 grid gap-2 border-t border-gray-100 pt-5 text-sm sm:grid-cols-3"><div><span className="text-gray-400">Subtotal</span><p className="font-semibold">৳{Number(order.subtotal||0).toFixed(2)}</p></div><div><span className="text-gray-400">Delivery</span><p className="font-semibold">৳{Number(order.delivery_fee||0).toFixed(2)}</p></div><div><span className="text-gray-400">Status</span><p className="font-semibold">{statusLabels[order.status]||order.status}</p></div></div>
          </article>)}
          <div className="rounded-3xl bg-kiaan-deep px-6 py-7 text-white sm:px-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-kiaan-soft">All Orders</p><h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">Total Bill</h2></div><p className="text-3xl font-bold sm:text-4xl">৳{combinedTotal.toFixed(2)}</p></div><p className="mt-3 text-xs leading-6 text-white/60">This combined amount is the sum of each individual order total shown above.</p></div>
        </div>}
      </div>
    </main>
    <Footer/>
  </>;
}
