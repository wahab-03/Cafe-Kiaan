"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {useCart} from "../../context/CartContext";
import {api} from "../../lib/api";

export default function CheckoutPage(){
  const {items,subtotal,clearCart,hydrated}=useCart();
  const router=useRouter();
  const [form,setForm]=useState({name:"",phone:"",email:"",address:"",notes:""});
  const [customerToken,setCustomerToken]=useState("");
  const [authLoading,setAuthLoading]=useState(true);
  const [type,setType]=useState("delivery"),[payment,setPayment]=useState("cash_on_pickup");
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const [quote,setQuote]=useState(null),[quoteLoading,setQuoteLoading]=useState(false);

  useEffect(()=>{
    let active=true;
    try {
      const saved=localStorage.getItem("kiaan-customer");
      const parsed=saved?JSON.parse(saved):null;
      const token=parsed?.customerToken||"";
      if(!token){ router.replace("/account?next=/checkout"); return ()=>{active=false;}; }
      api.accountMe(token).then((data)=>{
        if(!active)return;
        setCustomerToken(data.customer_token||token);
        setForm(prev=>({...prev,
          name:data.customer?.name||prev.name,
          phone:data.customer?.phone||prev.phone,
          email:data.customer?.email||prev.email,
          address:data.customer?.address||prev.address,
        }));
      }).catch(()=>{
        localStorage.removeItem("kiaan-customer");
        if(active)router.replace("/account?next=/checkout");
      }).finally(()=>{if(active)setAuthLoading(false);});
    } catch {
      router.replace("/account?next=/checkout");
    }
    return ()=>{active=false;};
  },[router]);

  useEffect(()=>{
    let active=true;
    if(!items.length||authLoading||!customerToken){setQuote(null);return undefined;}
    setQuoteLoading(true);
    api.quoteOrder({
      order_type:type,
      customer:form,
      customer_token:customerToken,
      items:items.map(x=>({menu_item_id:x.id,quantity:x.quantity})),
    }).then((data)=>{if(active)setQuote(data);}).catch((err)=>{if(active)setError(err.message||"Could not calculate the order total.");}).finally(()=>{if(active)setQuoteLoading(false);});
    return ()=>{active=false;};
  },[items,type,customerToken,form.phone,form.email,authLoading]);

  const update=(k,v)=>setForm(p=>({...p,[k]:v}));

  async function submit(e){
    e.preventDefault();
    if(!items.length)return;
    if(type==="delivery"&&!form.address.trim()){setError("Please enter your delivery address.");return;}
    setBusy(true);setError("");
    try{
      const order=await api.createOrder({
        customer:form,
        customer_token:customerToken,
        items:items.map(x=>({menu_item_id:x.id,name:x.name,price:Number(x.price),quantity:x.quantity,image:x.image})),
        order_type:type,
        payment_method:type==="delivery"?"cash_on_delivery":payment,
      });
      const customerTokenFromOrder=order.customer_token||customerToken;
      localStorage.setItem("kiaan-customer",JSON.stringify({customerToken:customerTokenFromOrder,customer:{name:form.name,phone:form.phone,email:form.email,address:form.address}}));
      clearCart();sessionStorage.setItem("kiaan-last-order",JSON.stringify(order));router.push(`/order-success?id=${order.id}`);
    }catch(err){setError(err.message||"Could not place order.");}finally{setBusy(false);}
  }

  if(authLoading||!hydrated)return <><Header/><main className="min-h-[600px] bg-kiaan-cream flex items-center justify-center"><div className="text-center"><div className="mx-auto size-10 rounded-full border-2 border-kiaan-pink/20 border-t-kiaan-pink animate-spin"/><p className="mt-4 text-sm text-gray-500">Checking your Café Kiaan account...</p></div></main><Footer/></>;
  if(!items.length)return <><Header/><main className="min-h-[600px] bg-kiaan-cream flex items-center justify-center"><div className="text-center"><h1 className="font-serif text-3xl font-bold">Your cart is empty</h1><Link href="/menu" className="inline-block mt-5 bg-kiaan-pink text-white px-6 py-3 rounded-full text-xs font-bold">GO TO MENU</Link></div></main><Footer/></>;

  return <><Header/><main className="bg-kiaan-cream py-12 min-h-[700px]"><div className="max-w-6xl mx-auto px-5">
    <p className="text-kiaan-pink text-xs tracking-[.25em] font-bold">CHECKOUT</p><h1 className="font-serif text-4xl font-bold mt-2">Complete Your Order</h1>
    <div className="mt-4 rounded-xl border border-pink-100 bg-kiaan-soft/60 px-4 py-3 text-sm text-kiaan-deep">Signed in as <b>{form.name}</b> · {form.email}</div>
    <form onSubmit={submit} className="grid lg:grid-cols-[1fr_350px] gap-6 mt-5">
      <div className="space-y-5">
        <section className="bg-white rounded-2xl p-6 border border-pink-50"><h2 className="font-serif text-xl font-bold">Customer Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <input required value={form.name} onChange={e=>update("name",e.target.value)} placeholder="Full name *" className="field" />
            <input required value={form.phone} onChange={e=>update("phone",e.target.value)} placeholder="Phone *" className="field" />
            <input required readOnly type="email" value={form.email} className="field sm:col-span-2 bg-gray-50 text-gray-500" />
            <textarea value={form.address} onChange={e=>update("address",e.target.value)} placeholder="Delivery address" className="field sm:col-span-2 min-h-24" />
            <textarea value={form.notes} onChange={e=>update("notes",e.target.value)} placeholder="Order notes (optional)" className="field sm:col-span-2 min-h-20" />
          </div>
        </section>
        <section className="bg-white rounded-2xl p-6 border border-pink-50"><h2 className="font-serif text-xl font-bold">Order Type</h2><div className="grid sm:grid-cols-2 gap-3 mt-5">
          <label className={`p-4 rounded-xl border cursor-pointer ${type==="delivery"?"border-kiaan-pink bg-kiaan-soft":"border-gray-200"}`}><input type="radio" checked={type==="delivery"} onChange={()=>setType("delivery")} className="mr-2 accent-kiaan-pink"/><b>Delivery</b><p className="text-xs text-gray-500 mt-1 ml-5">{quote&&type==="delivery"?`৳${Number(quote.delivery_fee||0).toFixed(2)} delivery fee`:"Delivery fee from Odoo"}</p></label>
          <label className={`p-4 rounded-xl border cursor-pointer ${type==="pickup"?"border-kiaan-pink bg-kiaan-soft":"border-gray-200"}`}><input type="radio" checked={type==="pickup"} onChange={()=>setType("pickup")} className="mr-2 accent-kiaan-pink"/><b>Pickup</b><p className="text-xs text-gray-500 mt-1 ml-5">Collect from Café Kiaan</p></label>
        </div></section>
        {type==="pickup"&&<section className="bg-white rounded-2xl p-6 border border-pink-50"><h2 className="font-serif text-xl font-bold">Payment</h2><label className="mt-4 flex items-center gap-2 text-sm"><input type="radio" checked={payment==="cash_on_pickup"} onChange={()=>setPayment("cash_on_pickup")} className="accent-kiaan-pink"/> Cash on Pickup</label></section>}
        {error&&<div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>}
      </div>
      <aside className="bg-white rounded-2xl p-6 h-fit border border-pink-50"><h2 className="font-serif text-xl font-bold">Order Summary</h2><div className="space-y-3 mt-5">{items.map(x=><div key={x.id} className="flex justify-between gap-3 text-sm"><span>{x.name} × {x.quantity}</span><b>৳{(x.price*x.quantity).toFixed(2)}</b></div>)}</div><div className="border-t mt-5 pt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>৳{Number(quote?.subtotal??subtotal).toFixed(2)}</b></div><div className="flex justify-between"><span>Delivery</span><b>৳{Number(quote?.delivery_fee||0).toFixed(2)}</b></div><div className="flex justify-between"><span>{quote?.tax_label||"VAT"}</span><b>৳{Number(quote?.tax||0).toFixed(2)}</b></div><div className="flex justify-between text-lg font-bold pt-3 border-t"><span>Total</span><span className="text-kiaan-pink">{quoteLoading?"Calculating…":`৳${Number(quote?.total??subtotal).toFixed(2)}`}</span></div><p className="pt-2 text-[11px] leading-5 text-gray-400">Totals are calculated by Odoo using the current product and tax configuration.</p></div><button disabled={busy||quoteLoading} className="mt-6 w-full bg-kiaan-pink text-white rounded-full py-4 text-xs font-bold disabled:opacity-60">{busy?"PLACING ORDER...":"PLACE ORDER →"}</button></aside>
    </form>
  </div></main><Footer/><style jsx>{`.field{width:100%;border:1px solid #eadde1;border-radius:12px;padding:12px 14px;font-size:13px;outline:none}.field:focus{border-color:#af0532}`}</style></>;
}
