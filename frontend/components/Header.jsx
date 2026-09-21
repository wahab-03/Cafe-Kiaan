"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Menu as MenuIcon,
  X,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";

const navLinks = [
  ["HOME", "home"],
  ["MENU", "menu"],
  ["ABOUT US", "about"],
  ["CONTACT", "contact"],
];

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kiaan-customer");
      const parsed = saved ? JSON.parse(saved) : null;
      setCustomer(parsed?.customer || null);
    } catch {
      setCustomer(null);
    }
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header id="home">
      {/* TOP ANNOUNCEMENT BAR - NOT STICKY */}
      <div className="bg-kiaan-pink text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5 text-base">
          <span className="flex items-center gap-2">
            <Clock3 size={16} />
            We are open everyday 11:00 AM – 09:00 PM
          </span>

          <div className="flex items-center gap-3">
            <span className="hidden text-white/85 sm:block">
              Fresh food • Warm moments
            </span>

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-opacity hover:opacity-80"
            >
              <FacebookIcon className="size-5" />
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-opacity hover:opacity-80"
            >
              <InstagramIcon className="size-5" />
            </a>
          </div>
        </div>
      </div>

      {/* NAV + LOGO AREA */}
      <div className="relative">
        {/* LOGO */}
        <div className="pointer-events-none absolute inset-x-0 top-[4px] z-[60]">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
            <div className="pointer-events-none w-[120px]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-label="Café Kiaan home"
                className="pointer-events-auto relative block px-2 pb-4 pt-6"
              >
                {/* Logo-এর নিচের curved shape */}
                <span
                  className="absolute left-1/2 top-0 -z-10 h-[105px] w-[155px] -translate-x-1/2 bg-[#FFF9F6]"
                  style={{
                    borderRadius: "0 0 50% 50% / 0 0 42px 42px",
                  }}
                />

                <Logo className="relative z-10 h-28 w-auto scale-150" />
              </Link>
            </div>
          </div>
        </div>

        {/* ONLY NAVIGATION IS STICKY */}
        <div className="sticky top-0 z-50 border-b border-[#EDE2DC] bg-[#FFF9F6]">
          <nav className="mx-auto flex h-[92px] max-w-[1600px] items-center justify-between px-4 py-3">
            {/* Logo-এর জায়গা ধরে রাখবে */}
            <div className="w-[120px] shrink-0" aria-hidden="true" />

            {/* DESKTOP NAVIGATION */}
            <ul className="hidden items-center gap-7 text-[16px] font-semibold tracking-wide lg:flex">
              {navLinks.map(([label, id]) => (
                <li key={label}>
                  {id === "menu" ? (
                    <Link
                      href="/menu"
                      className="nav-link-underline hover:text-kiaan-pink"
                    >
                      {label}
                    </Link>
                  ) : id === "about" ? (
                    <Link
                      href="/about"
                      className="nav-link-underline hover:text-kiaan-pink"
                    >
                      {label}
                    </Link>
                  ) : id === "contact" ? (
                    <Link
                      href="/contact"
                      className="nav-link-underline hover:text-kiaan-pink"
                    >
                      {label}
                    </Link>
                  ) : (
                    <Link
                      href="/"
                      className="nav-link-underline hover:text-kiaan-pink"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
              <Link
                href="/account?next=/orders"
                className="signin-link hidden rounded-full px-3 py-2 text-base font-semibold text-gray-600 transition-colors hover:text-kiaan-pink sm:block"
              >
                <span className="nav-link-underline">
                  {customer?.name
                    ? `Hi, ${customer.name.split(" ")[0]}`
                    : "Sign In"}
                </span>
              </Link>

              <Link
                href="/orders"
                className="orders-nav-button hidden rounded-full px-3.5 py-2 text-base font-semibold text-gray-600 sm:block lg:block"
              >
                <span>Orders</span>
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 rounded-full border border-pink-100 px-3.5 py-2 text-base font-medium transition-colors hover:border-kiaan-pink hover:text-kiaan-pink"
                aria-label="View cart"
              >
                <ShoppingCart size={16} />
                <span>{count > 0 ? `Cart ${count}` : "Cart"}</span>
              </Link>

              <Link
                href="/menu"
                className="hidden items-center gap-2 rounded-full bg-kiaan-pink px-4 py-2 text-sm font-semibold text-white hover:bg-kiaan-deep sm:flex"
              >
                Order Online <ArrowRight size={14} />
              </Link>

              <button
                className="text-kiaan-pink lg:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? <X size={25} /> : <MenuIcon size={25} />}
              </button>
            </div>
          </nav>

          {/* MOBILE MENU */}
          {open && (
            <div className="border-t border-[#EDE2DC] bg-[#FFF9F6] px-4 py-4 lg:hidden">
              <div className="space-y-1 text-sm font-semibold">
                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/"
                  onClick={closeMenu}
                >
                  HOME
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/menu"
                  onClick={closeMenu}
                >
                  MENU
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/about"
                  onClick={closeMenu}
                >
                  ABOUT US
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/contact"
                  onClick={closeMenu}
                >
                  CONTACT
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/account?next=/orders"
                  onClick={closeMenu}
                >
                  {customer?.name
                    ? `ACCOUNT · ${customer.name}`
                    : "SIGN IN"}
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/orders"
                  onClick={closeMenu}
                >
                  ORDER HISTORY
                </Link>

                <Link
                  className="block rounded-md px-2 py-2 hover:bg-kiaan-soft"
                  href="/cart"
                  onClick={closeMenu}
                >
                  {count > 0 ? `CART (${count})` : "CART"}
                </Link>

                <Link
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-kiaan-pink px-5 py-2.5 text-white"
                  href="/menu"
                  onClick={closeMenu}
                >
                  Order Online <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
