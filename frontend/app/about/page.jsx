import Link from "next/link";
import { ArrowRight, Heart, Leaf, Sparkles, Users } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const values = [
  { icon: Leaf, title: "Fresh Ingredients", text: "We focus on fresh, thoughtfully chosen ingredients so every plate feels satisfying, familiar and full of flavor." },
  { icon: Heart, title: "Warm Hospitality", text: "From the first welcome to the last sip of coffee, we want every guest to feel comfortable and cared for." },
  { icon: Sparkles, title: "Simple Quality", text: "We believe good food does not need to be complicated. Careful preparation and consistent quality come first." },
  { icon: Users, title: "Memorable Moments", text: "Café Kiaan is made for everyday meals, coffee breaks and relaxed moments worth remembering." },
];

export default function AboutPage(){
  return (
    <>
      <Header />
      <main className="bg-kiaan-cream">
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
            <p className="text-kiaan-pink text-xs font-bold tracking-[0.28em]">ABOUT CAFÉ KIAAN</p>
            <h1 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight text-kiaan-ink sm:text-5xl lg:text-6xl">Fresh food, warm coffee and a place to slow down.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">Café Kiaan is a welcoming destination where fresh food, warm coffee and memorable moments come together.</p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
              <div className="overflow-hidden rounded-3xl shadow-kiaan">
                <img src="/images/cafe-interior.png" alt="Café Kiaan interior" className="h-[320px] w-full object-cover sm:h-[420px]" />
              </div>
              <div>
                <p className="text-kiaan-pink text-xs font-bold tracking-[0.25em]">OUR STORY</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-kiaan-ink sm:text-4xl">A comfortable place for good food and good company.</h2>
                <p className="mt-5 text-[15px] leading-8 text-gray-600 sm:text-base">Café Kiaan brings together the things that make a casual dining experience feel special: food prepared with care, coffee worth lingering over and a comfortable atmosphere for sharing a meal or taking a quiet break.</p>
                <p className="mt-4 text-[15px] leading-8 text-gray-600 sm:text-base">Our approach is simple. We aim to serve delicious food with quality ingredients, keep the experience welcoming and make every visit feel easy, relaxed and memorable.</p>
                <Link href="/menu" className="mt-7 inline-flex items-center gap-2 rounded-full bg-kiaan-pink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kiaan-deep">Explore Our Menu <ArrowRight size={16}/></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-kiaan-pink text-xs font-bold tracking-[0.25em]">WHAT WE BELIEVE</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-kiaan-ink sm:text-4xl">The Café Kiaan philosophy</h2>
              <p className="mt-4 text-[15px] leading-7 text-gray-600 sm:text-base">Quality, comfort and genuine hospitality guide the way we think about food and the people we serve.</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({icon:Icon,title,text})=>(
                <article key={title} className="rounded-2xl border border-pink-100 bg-kiaan-cream p-6 sm:p-7">
                  <span className="grid size-11 place-items-center rounded-full bg-kiaan-soft text-kiaan-pink"><Icon size={20}/></span>
                  <h3 className="mt-5 font-serif text-xl font-bold text-kiaan-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl rounded-3xl bg-kiaan-deep px-6 py-12 text-center text-white shadow-kiaan sm:px-10 sm:py-14">
            <p className="text-xs font-bold tracking-[0.25em] text-kiaan-soft">WHY CHOOSE CAFÉ KIAAN</p>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Come for the food. Stay for the moments.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">Whether you are sharing a meal, meeting someone over coffee or simply enjoying a comfortable break, Café Kiaan is here to make the moment feel a little warmer.</p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-kiaan-pink transition-colors hover:bg-kiaan-soft">Visit Us <ArrowRight size={16}/></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
