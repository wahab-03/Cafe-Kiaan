"use client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {useEffect,useState} from "react";

const API=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";
const PREFIX=process.env.NEXT_PUBLIC_API_PREFIX||"/api";
const statuses=["PENDING","CONFIRMED","PREPARING","READY","OUT_FOR_DELIVERY","COMPLETED","CANCELLED"];

export default function Staff(){
  const [orders,setOrders]=useState([]),[error,setError]=useState("");
  async function load(){try{const r=await fetch(`${API}${PREFIX}/orders`,{cache:"no-store"});if(!r.ok)throw Error("Could not load orders");setOrders(await r.json())}catch(e){setError(e.message)}}
  async function update(id,status){await fetch(`${API}${PREFIX}/orders/${id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});load()}
  useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[]);
  return <><Header/><main className="bg-kiaan-cream min-h-[700px] py-10"><div className="max-w-7xl mx-auto px-5"><div className="flex justify-between items-end"><div><p className="text-kiaan-pink text-xs tracking-[.25em] font-bold">STAFF / KDS</p><h1 className="font-serif text-4xl font-bold mt-2">Order Management</h1></div><button onClick={load} className="bg-kiaan-pink text-white rounded-full px-5 py-2 text-xs font-bold">REFRESH</button></div>
  {error&&<div className="mt-5 bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>}
  <div className="grid lg:grid-cols-2 gap-4 mt-7">{orders.map(o=><article key={o.id} className="bg-white rounded-2xl p-5 border border-pink-100"><div className="flex justify-between gap-3"><div><b>#{o.id.slice(-8)}</b><p className="text-xs text-gray-500 mt-1">{o.customer?.name} • {o.customer?.phone}</p></div><span className="text-kiaan-pink font-bold">৳{o.total}</span></div><p className="text-xs mt-4">{o.order_type.toUpperCase()} • {o.items.map(x=>`${x.name} × ${x.quantity}`).join(", ")}</p><select value={o.status} onChange={e=>update(o.id,e.target.value)} className="mt-4 w-full border rounded-xl px-3 py-2 text-xs">{statuses.map(s=><option key={s}>{s}</option>)}</select></article>)}</div>
  {!orders.length&&!error&&<div className="text-center py-20 text-gray-500">No orders yet.</div>}</div></main><Footer/></>;
}
