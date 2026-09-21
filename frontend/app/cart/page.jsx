"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { api } from "../../lib/api";


function SuggestedProducts({ onAdd, cartItems }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const normalize = (value) => String(value || "").trim().toLowerCase();
    const words = (value) => normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
    const typeKeywords = {
      main: ["burger", "pizza", "pasta", "sandwich", "wrap", "platter", "alfredo", "pepperoni"],
      side: ["fries", "side", "bread", "nugget", "wing", "coleslaw", "sauce", "dip", "extra"],
      seafood: ["shrimp", "prawn", "fish", "seafood"],
      beverage: ["drink", "pepsi", "cola", "soda", "juice", "water", "lemonade"],
      coffee: ["coffee", "latte", "cappuccino", "americano", "mocha", "espresso"],
      dessert: ["cake", "dessert", "brownie", "cookie", "ice cream", "pudding"],
    };
    const classify = (item) => {
      const text = [item.name, item.category, item.description].map(normalize).join(" ");
      return Object.entries(typeKeywords).filter(([, keys]) => keys.some((key) => text.includes(key))).map(([type]) => type);
    };
    const complementaryTypes = {
      main: ["side", "beverage", "dessert"], seafood: ["side", "beverage", "sauce"],
      side: ["main", "seafood", "beverage", "sauce"], beverage: ["main", "side", "dessert"],
      coffee: ["dessert", "beverage"], dessert: ["coffee", "beverage"],
    };
    const typeFor = (item) => { const types = classify(item); return types.length ? types : ["main"]; };

    api.menu()
      .then((data) => {
        if (!active || !Array.isArray(data)) return;
        const cartIds = new Set(cartItems.map((item) => String(item.id)));
        const cartNames = new Set(cartItems.map((item) => normalize(item.name)));
        const optional = [];
        const optionalSeen = new Set();

        // Odoo Optional Sales is the authoritative recommendation source whenever
        // at least one cart product has explicit optional products configured.
        for (const cartItem of cartItems) {
          const source = data.find((item) => String(item.id) === String(cartItem.id));
          for (const item of (source?.optional_products || [])) {
            const id = String(item.id);
            const name = normalize(item.name);
            if (cartIds.has(id) || cartNames.has(name) || optionalSeen.has(id) || optionalSeen.has(name)) continue;
            optionalSeen.add(id); optionalSeen.add(name); optional.push(item);
          }
        }
        if (optional.length) {
          setSuggestions(optional.slice(0, 4));
          return;
        }

        // Preserve the existing contextual fallback when Odoo has no explicit Optional Sales.
        const cartTypes = new Set(cartItems.flatMap(typeFor));
        const cartWords = new Set(cartItems.flatMap((item) => words(`${item.name} ${item.category} ${item.description}`)));
        const seen = new Set();
        const candidates = data.filter((item) => {
          const id = String(item.id); const name = normalize(item.name);
          return !cartIds.has(id) && !cartNames.has(name);
        });
        const scored = candidates.map((item) => {
          const itemWords = new Set(words(`${item.name} ${item.category} ${item.description}`));
          const itemTypes = typeFor(item); let score = 0;
          itemTypes.forEach((type) => {
            if (cartTypes.has(type)) score += 2;
            cartTypes.forEach((sourceType) => { if ((complementaryTypes[sourceType] || []).includes(type)) score += 5; });
          });
          itemWords.forEach((word) => { if (word.length >= 4 && cartWords.has(word)) score += 2; });
          if (cartItems.some((cartItem) => normalize(cartItem.category) === normalize(item.category))) score += 1;
          if (item.featured) score += 0.5;
          return { item, score };
        });
        scored.sort((a, b) => b.score - a.score || normalize(a.item.name).localeCompare(normalize(b.item.name)));
        const ranked = [];
        for (const { item } of scored) {
          const name = normalize(item.name);
          if (seen.has(name)) continue;
          seen.add(name); ranked.push(item);
          if (ranked.length === 4) break;
        }
        setSuggestions(ranked);
      })
      .catch(() => { if (active) setSuggestions([]); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [cartItems]);

  if (loading || !suggestions.length) return null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-50 shadow-sm mt-8">
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-800 mb-6">You Might Also Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {suggestions.map((item) => (
          <article
            key={item.id}
            className="flex min-h-[248px] flex-col overflow-hidden rounded-2xl border border-pink-50 bg-pink-50/20 transition-all hover:bg-white sm:min-h-[270px]"
          >
            <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-40">
              <img
                src={item.image || "/images/kiaan-hero.jpg"}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="min-w-0">
                <h4 className="font-serif text-[17px] font-semibold leading-snug text-gray-800 sm:text-xl break-words">{item.name}</h4>
                <p className="mt-1.5 text-base font-bold text-kiaan-pink">৳{item.price}</p>
              </div>
              <div className="mt-auto flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => onAdd && onAdd(item)}
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-kiaan-pink px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  + Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, changeQuantity, removeItem, addItem } = useCart();
  const [quote, setQuote] = useState(null);
  const router = useRouter();

  function proceedToCheckout() {
    try {
      const saved = localStorage.getItem("kiaan-customer");
      const customer = saved ? JSON.parse(saved) : null;
      router.push(customer?.customerToken ? "/checkout" : "/account?next=/checkout");
    } catch {
      router.push("/account?next=/checkout");
    }
  }

  useEffect(() => {
    let active = true;
    if (!items.length) { setQuote(null); return undefined; }
    api.quoteOrder({
      order_type: "delivery",
      items: items.map((x) => ({menu_item_id: x.id, quantity: x.quantity})),
    }).then((data) => { if (active) setQuote(data); }).catch(() => { if (active) setQuote(null); });
    return () => { active = false; };
  }, [items]);

  return (
    <>
      <Header />
      <main className="min-h-[650px] bg-kiaan-cream py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <p className="text-kiaan-pink text-xs tracking-[.25em] font-bold">YOUR ORDER</p>
          <h1 className="font-serif text-4xl font-bold mt-2">Shopping Cart</h1>
          
          {!items.length ? (
            <div className="bg-white rounded-2xl p-12 text-center mt-8 border border-pink-100">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">Your cart is empty</h2>
              <p className="text-sm text-gray-500 mt-2">Add something delicious from our menu.</p>
              <Link href="/menu" className="inline-block mt-6 bg-kiaan-pink text-white rounded-full px-6 py-3 text-xs font-bold">
                EXPLORE MENU →
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-8 xl:gap-10 mt-8">
              <div>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl p-5 sm:p-6 grid grid-cols-[112px_minmax(0,1fr)_auto] sm:flex gap-5 items-center border border-pink-50 shadow-sm min-h-[154px] sm:min-h-[168px]">
                      <div className="relative w-[112px] h-[112px] sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0">
                        <img src={item.image || "/images/kiaan-hero.jpg"} alt={item.name} className="h-full w-full object-cover" data-fallback={item.fallback_image || "/images/kiaan-hero.jpg"} onError={(e)=>{const fallback=e.currentTarget.dataset.fallback || "/images/kiaan-hero.jpg"; if(e.currentTarget.src!==fallback)e.currentTarget.src=fallback;}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-lg sm:text-xl leading-snug break-words">{item.name}</h3>
                        <p className="text-kiaan-pink font-bold text-base sm:text-lg mt-2">৳{item.price}</p>
                      </div>
                      <div className="col-start-3 row-start-1 sm:ml-auto flex items-center gap-3">
                        <button onClick={() => changeQuantity(item.id, -1)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center">
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-base sm:text-lg font-bold">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.id, 1)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center">
                          <Plus size={13} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="col-start-3 row-start-2 sm:col-auto sm:row-auto justify-self-end text-gray-400 hover:text-red-500 p-2">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ডাইনামিক সাজেস্টেড প্রোডাক্টস */}
                <SuggestedProducts onAdd={(item) => addItem && addItem(item)} cartItems={items} />
              </div>

              <aside className="bg-white rounded-3xl p-9 sm:p-11 h-fit border border-pink-50 shadow-sm lg:sticky lg:top-28">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold">Order Summary</h2>
                <div className="space-y-4 mt-9 text-lg">
                  <div className="flex justify-between gap-4"><span>Subtotal</span><b>৳{Number((quote?.subtotal ?? subtotal)).toFixed(2)}</b></div>
                  <div className="flex justify-between gap-4 text-gray-500"><span>Delivery fee</span><span>{quote ? `৳${Number(quote.delivery_fee || 0).toFixed(2)}` : "Calculating…"}</span></div>
                  <div className="flex justify-between gap-4"><span>{quote?.tax_label || "VAT"}</span><span>৳{Number(quote?.tax || 0).toFixed(2)}</span></div>
                </div>
                <div className="border-t mt-8 pt-8 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-kiaan-pink">{quote ? `৳${Number(quote.total).toFixed(2)}` : `৳${Number(subtotal).toFixed(2)}`}</span>
                </div>
                <button type="button" onClick={proceedToCheckout} className="mt-9 w-full bg-kiaan-pink text-white rounded-full py-4 text-base font-bold flex items-center justify-center gap-2">
                  PROCEED TO CHECKOUT <ArrowRight size={14} />
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}