import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";

const values = [
  { icon: Leaf, title: "Fresh Ingredients", text: "Thoughtfully chosen ingredients and careful preparation keep every dish fresh and satisfying." },
  { icon: Heart, title: "Warm Hospitality", text: "We want every visit to feel comfortable, welcoming and easy to enjoy." },
  { icon: Sparkles, title: "Memorable Moments", text: "Good food, coffee and a relaxed atmosphere make space for moments worth remembering." },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-28 bg-[#FFF9F6] py-8 sm:py-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid gap-12 rounded-3xl border border-[#EDE2DC] bg-[#FBF6F2] p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl">
            <div className="relative h-72 sm:h-96">
              <Image src="/images/cafe-interior.png" alt="Cozy interior of Café Kiaan" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <SectionHeading title="About Café Kiaan" />
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-gray-600 sm:text-lg">
              Café Kiaan is a welcoming dining space where fresh food, warm coffee and genuine hospitality come together. We focus on quality ingredients, thoughtful preparation and a comfortable atmosphere for everyday meals and relaxed coffee breaks.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {values.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-[#E9D7D2] bg-[#FFFCFA] p-4 shadow-[0_2px_8px_rgba(90,50,35,0.05)]">
                  <span className="grid size-9 place-items-center rounded-full bg-kiaan-soft text-kiaan-pink"><Icon size={17} /></span>
                  <h3 className="mt-3 font-serif text-base font-bold text-kiaan-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="mt-7 inline-flex items-center gap-2 rounded-full border border-kiaan-pink px-5 py-2.5 text-base font-semibold text-kiaan-pink transition-colors hover:bg-kiaan-pink hover:text-white">
              More About Café Kiaan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
