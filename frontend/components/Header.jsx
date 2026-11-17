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
import { api } from "../lib/api";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    setProfileOpen(false);
  }

  async function logout() {
    let token = "";
    try {
      const saved = localStorage.getItem("kiaan-customer");
      const parsed = saved ? JSON.parse(saved) : null;
      token = parsed?.customerToken || "";
    } catch {
      token = "";
    }

    setLoggingOut(true);
    try {
      if (token) await api.accountLogout(token);
    } catch {
    } finally {
      localStorage.removeItem("kiaan-customer");
      setCustomer(null);
      setOpen(false);
      setProfileOpen(false);
      setLoggingOut(false);
      window.location.assign("/");
    }
  }

  return (
    <header id="home">
      <div className="bg-kiaan-pink text-white">
        <div className="site-container flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 text-xs sm:text-sm lg:text-base">
          <span className="flex items-center gap-2">
            <Clock3 size={16} className="shrink-0" />
            Open daily 11:00 AM – 08:00 PM
          </span>

          <div className="flex items-center gap-3">
            <span className="hidden text-white/85 lg:block">
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

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-[4px] z-[60]">
          <div className="site-container">
            <div className="pointer-events-none w-[88px] sm:w-[120px]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-label="Café Kiaan home"
                className="pointer-events-auto relative flex justify-center px-2 pb-3 pt-3 sm:pb-4 sm:pt-6"
              >
                <span
                  className="absolute left-1/2 top-0 -z-10 h-[108px] w-[120px] sm:h-[159px] sm:w-[220px] -translate-x-1/2 bg-[#FFF9F6]"
                  style={{
                    borderRadius: "0 0 50% 50% / 0 0 65px 65px",
                  }}
                />

                <Logo className="relative z-10 h-20 w-auto sm:h-24 sm:scale-125" />
              </Link>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-50 border-b border-[#EDE2DC] bg-[#FFF9F6]">
          <nav className="site-container flex h-[96px] items-center justify-between gap-4 py-3 sm:h-[122px]">
            <div className="w-[88px] shrink-0 sm:w-[150px]" aria-hidden="true" />

            <ul className="hidden shrink-0 items-center gap-5 whitespace-nowrap text-sm font-semibold tracking-wide xl:flex 2xl:gap-9 2xl:text-base">
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

            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap 2xl:gap-5">
              {customer?.name ? (
                <div
                  className="relative hidden md:block"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <button
                    type="button"
                    className="signin-link max-w-[140px] truncate rounded-full px-3 py-2 text-base font-semibold text-gray-600 transition-colors hover:text-kiaan-pink"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((value) => !value)}
                  >
                    <span className="nav-link-underline">
                      {`Hi, ${customer.name.split(" ")[0]}`}
                    </span>
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-[80] mt-1 min-w-[180px] rounded-xl border border-[#EDE2DC] bg-white p-1.5 shadow-xl"
                    >
                      <Link
                        role="menuitem"
                        href="/account?next=/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-kiaan-soft hover:text-kiaan-pink"
                      >
                        My Account
                      </Link>
                      <button
                        role="menuitem"
                        type="button"
                        disabled={loggingOut}
                        onClick={logout}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-kiaan-soft hover:text-kiaan-pink disabled:opacity-60"
                      >
                        {loggingOut ? "Logging out…" : "Log Out"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/account?next=/orders"
                  className="signin-link hidden rounded-full px-3 py-2 text-base font-semibold text-gray-600 transition-colors hover:text-kiaan-pink md:block"
                >
                  <span className="nav-link-underline">Sign In</span>
                </Link>
              )}

              <Link
                href="/orders"
                className="orders-nav-button hidden rounded-full px-3.5 py-2 text-base font-semibold text-gray-600 md:block"
              >
                <span>Orders</span>
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 rounded-full border border-kiaan-line px-3.5 py-2 text-base font-medium transition-colors hover:border-kiaan-pink hover:text-kiaan-pink"
                aria-label="View cart"
              >
                <ShoppingCart size={16} />
                <span >Cart</span>
                <span className="grid size-[22px] place-items-center rounded-full bg-[#3F6B4E] text-xs font-semibold leading-none text-white">
                  {count}
                </span>
              </Link>

              <Link
                href="/menu"
                className="hidden items-center gap-2 rounded-full bg-kiaan-pink px-4 py-2 text-sm font-semibold text-white hover:bg-kiaan-deep sm:flex"
              >
                Order Online <ArrowRight size={14} />
              </Link>

              <button
                className="text-kiaan-pink xl:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? <X size={25} /> : <MenuIcon size={25} />}
              </button>
            </div>
          </nav>

          {open && (
            <div className="site-container border-t border-[#EDE2DC] bg-[#FFF9F6] pb-4 pt-8 sm:pt-12 xl:hidden">
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

                {customer?.name && (
                  <button
                    type="button"
                    className="block w-full rounded-md px-2 py-2 text-left hover:bg-kiaan-soft"
                    onClick={logout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? "LOGGING OUT…" : "LOG OUT"}
                  </button>
                )}

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
                  {`CART (${count})`}
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
