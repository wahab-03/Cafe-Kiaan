import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative mx-auto isolate min-h-[600px] -w-full overflow-hidden">
      <Image
        src="/images/hero-bg-2.png"
        alt="Café Kiaan dining table with food, coffee and a warm restaurant interior"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

      <div className="mx-auto flex min-h-[420px] max-w-[1600px] items-center px-4 py-14 sm:px-6 sm:py-16 lg:py-16">
        <div className="max-w-xl text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-kiaan-soft/90">Welcome to</p>
          <h1 className="font-serif text-5xl font-bold uppercase leading-[1.02] sm:text-6xl lg:text-7xl">
            Café <span className="text-kiaan-soft">Kiaan</span>
          </h1>
          <p className="mt-3 font-serif text-2xl tracking-wide sm:text-3xl">Food • Coffee • Moments</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            A cozy dining space in Sylhet serving delicious food, aromatic coffee and warm hospitality.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu" className="flex items-center gap-2 rounded-full bg-kiaan-pink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kiaan-deep">
              Order Online <ArrowRight size={16} />
            </Link>
            <a href="#menu" className="flex items-center gap-2 rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-kiaan-pink">
              View Menu
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-white/15"><Clock size={16} /></span>
              <span><span className="block font-semibold">Open Everyday</span><span className="text-white/70">11:00 AM – 09:00 PM</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-white/15"><MapPin size={16} /></span>
              <span><span className="block font-semibold">Zindabazar, Sylhet</span><span className="text-white/70">Bangladesh</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
