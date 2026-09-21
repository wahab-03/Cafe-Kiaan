"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({children}) {
  const [items,setItems] = useState([]);
  const [hydrated,setHydrated] = useState(false);
  useEffect(()=>{
    try { const x=localStorage.getItem("kiaan-cart"); if(x)setItems(JSON.parse(x)); }
    catch {}
    finally { setHydrated(true); }
  },[]);
  useEffect(()=>{
    if(hydrated) localStorage.setItem("kiaan-cart",JSON.stringify(items));
  },[items,hydrated]);

  function addItem(item,qty=1){
    setItems(prev=>{
      const found=prev.find(x=>x.id===item.id);
      return found
        ? prev.map(x=>x.id===item.id?{...x,quantity:x.quantity+qty}:x)
        : [...prev,{...item,quantity:qty}];
    });
  }
  function changeQuantity(id,delta){
    setItems(prev=>prev.map(x=>x.id===id?{...x,quantity:x.quantity+delta}:x).filter(x=>x.quantity>0));
  }
  function removeItem(id){ setItems(prev=>prev.filter(x=>x.id!==id)); }
  function clearCart(){ setItems([]); }

  const subtotal=useMemo(()=>items.reduce((s,x)=>s+Number(x.price)*x.quantity,0),[items]);
  const count=useMemo(()=>items.reduce((s,x)=>s+x.quantity,0),[items]);

  return <CartContext.Provider value={{items,addItem,changeQuantity,removeItem,clearCart,subtotal,count,hydrated}}>
    {children}
  </CartContext.Provider>;
}
export function useCart(){ return useContext(CartContext); }
