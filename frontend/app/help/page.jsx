import Header from "../../components/Header";
import Footer from "../../components/Footer";
const faqs=[
["How do I order?","Open the Menu, select a category, choose a product, add it to your cart and complete checkout."],
["Can I order for pickup?","Yes. Select Pickup during checkout and pay cash when collecting your order."],
["What is the delivery fee?","The delivery fee is read from the Café Kiaan Delivery Fee product configured in Odoo, so the website uses the current Odoo value."],
["Can I change my order?","Contact the restaurant as soon as possible after placing the order. Changes depend on whether preparation has started."]
];
export default function Help(){return <><Header/><main className="bg-kiaan-cream py-14 min-h-[600px]"><div className="max-w-3xl mx-auto px-5"><p className="text-kiaan-pink text-xs tracking-[.25em] font-bold">HELP</p><h1 className="font-serif text-4xl font-bold mt-2">Frequently Asked Questions</h1><div className="mt-8 space-y-3">{faqs.map(([q,a])=><details key={q} className="bg-white rounded-2xl p-5 border border-pink-100"><summary className="font-bold cursor-pointer">{q}</summary><p className="text-sm text-gray-500 leading-6 mt-3">{a}</p></details>)}</div></div></main><Footer/></>;}
