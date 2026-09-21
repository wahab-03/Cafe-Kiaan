"use client";
import Link from "next/link";
import { MapPin, Clock3, Phone, Mail, ArrowUp } from "lucide-react";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-kiaan-cream text-kiaan-ink">
      {/* Decorative Coffee Cup - Footer Right Side */}
      <svg
        className="pointer-events-none absolute -right-[-51px] bottom-[122px] hidden h-36 w-36 text-kiaan-pink/20 lg:block"
        viewBox="0 0 120 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Saucer */}
        <ellipse cx="60" cy="118" rx="46" ry="9" />
        <ellipse cx="60" cy="114" rx="38" ry="6" />

        {/* Cup Body */}
        <path d="M32 58 Q32 98 60 104 Q88 98 88 58" />
        <path d="M32 58 Q46 50 60 52 Q74 50 88 58" />

        {/* Handle */}
        <path d="M88 68 Q105 68 105 84 Q105 98 88 96" />

        {/* Steam / Leaves - Animated */}
        <g className="origin-bottom animate-[steam_3.8s_ease-in-out_infinite]">
          <path d="M48 48 Q42 32 50 18" className="opacity-80" />
          <path d="M45 30 Q40 20 48 12" />
        </g>

        <g className="origin-bottom animate-[steam_3.8s_ease-in-out_infinite_0.7s]">
          <path d="M60 45 Q57 28 62 12" className="opacity-90" />
          <path d="M58 26 Q54 15 64 8" />
        </g>

        <g className="origin-bottom animate-[steam_3.8s_ease-in-out_infinite_1.4s]">
          <path d="M72 48 Q78 32 70 18" className="opacity-80" />
          <path d="M75 30 Q80 20 72 12" />
        </g>
      </svg>
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:py-8">
        <div>
          <Logo  className="h-32 translate-x-6" />
          <p className="mt-4 max-w-sm text-[15px] leading-6 text-kiaan-ink/65 sm:text-base">Food • Coffee • Moments </p>
          <div className="mt-4 flex gap-2">
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-11 place-items-center rounded-full bg-kiaan-pink/10 text-kiaan-pink transition-colors hover:bg-kiaan-pink/20"><FacebookIcon className="size-5" /></a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-full bg-kiaan-pink/10 text-kiaan-pink transition-colors hover:bg-kiaan-pink/20"><InstagramIcon className="size-5" /></a>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold tracking-[0.16em] text-kiaan-pink">QUICK LINKS</h3>
          <div className="mt-4 space-y-2.5 text-[16px] leading-6 text-kiaan-ink/75">
            <Link className="block hover:text-kiaan-pink" href="/">Home</Link>
            <Link className="block hover:text-kiaan-pink" href="/menu">Menu</Link>
            <Link className="block hover:text-kiaan-pink" href="/about">About Us</Link>
            <Link className="block hover:text-kiaan-pink" href="/contact">Contact Us</Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold tracking-[0.16em] text-kiaan-pink">HELP</h3>
          <div className="mt-4 space-y-2.5 text-[16px] leading-6 text-kiaan-ink/75">
            <Link className="block hover:text-kiaan-pink" href="/help">Help / FAQ</Link>
            <Link className="block hover:text-kiaan-pink" href="/privacy-policy">Privacy Policy</Link>
            <Link className="block hover:text-kiaan-pink" href="/terms">Terms & Conditions</Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold tracking-[0.16em] text-kiaan-pink">CONTACT US</h3>
          <div className="mt-4 space-y-2.5 text-[16px] leading-6 text-kiaan-ink/75">
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-kiaan-pink" /> Zindabazar, Sylhet, Bangladesh</p>
            <p className="flex items-start gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-kiaan-pink" /> Everyday · 11 AM - 9 PM</p>
            <p className="flex items-start gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-kiaan-pink" /> <a href="tel:+8801712345678" className="hover:text-kiaan-pink">+880 1712 345 678</a></p>
            <p className="flex items-start gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-kiaan-pink" /> <a href="mailto:info@cafekiaan.com" className="hover:text-kiaan-pink">info@cafekiaan.com</a></p>
          </div>
        </div>
      </div>
      <div className="relative bg-kiaan-pink px-4 py-4 text-white">
        <p className="text-center text-base">© 2026 Café Kiaan. All rights reserved.</p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="absolute right-4 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          <ArrowUp size={31} />
        </button>
      </div>
    </footer>
  );
}