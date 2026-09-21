"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api } from "../../lib/api";

const STORAGE_KEY = "kiaan-customer";
const SWITCH_MS = 1500;
const SWITCH_MIDPOINT_MS = 700;

function saveCustomer(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    customerToken: data.customer_token,
    customer: data.customer,
  }));
}

function AccountContent() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedNext = params.get("next") || "/orders";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/orders";
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [switching, setSwitching] = useState(false);
  const [switchDirection, setSwitchDirection] = useState("forward");

  useEffect(() => {
    let active = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const customer = saved ? JSON.parse(saved) : null;
      if (!customer?.customerToken) return undefined;
      api.accountMe(customer.customerToken).then((data) => {
        if (active) {
          saveCustomer(data);
          setNotice("You are already signed in.");
        }
      }).catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      });
    } catch {}
    return () => { active = false; };
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function switchMode(nextMode) {
    if (switching || nextMode === mode) return;

    setError("");
    setNotice("");
    setShowPassword(false);
    setSwitchDirection(mode === "login" && nextMode === "signup" ? "forward" : "reverse");
    setSwitching(true);

    // The supplied reference takes the current white/black split to full black,
    // swaps the two sides while hidden, then reveals the new form through the
    // reverse diagonal wedge. The 700ms midpoint is deliberately inside the
    // full-black section of the 1.50s sweep.
    window.setTimeout(() => setMode(nextMode), SWITCH_MIDPOINT_MS);
    window.setTimeout(() => setSwitching(false), SWITCH_MS);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const data = mode === "login"
        ? await api.accountLogin({ email: form.email, password: form.password })
        : await api.accountRegister({
            customer: {
              name: form.name,
              phone: form.phone,
              email: form.email,
              address: form.address,
            },
            password: form.password,
          });
      saveCustomer(data);
      setNotice(mode === "signup" ? "Account created successfully." : "Signed in successfully.");
      router.replace(next);
    } catch (err) {
      setError(err.message || "Could not complete your account request.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <>
      <Header />
      <main className="account-page min-h-[720px] bg-kiaan-cream px-4 py-10 sm:px-6 sm:py-14">
        <div
          className={`account-card mx-auto max-w-5xl ${isSignup ? "is-signup" : ""} ${switching ? "is-switching" : ""} ${switching && switchDirection === "reverse" ? "is-reverse" : ""}`}
        >
          <section className="account-form-panel">
            <div className="account-form-content mx-auto w-full max-w-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.22em] text-kiaan-pink">YOUR ACCOUNT</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-kiaan-ink sm:text-4xl">
                    {isSignup ? "Sign Up" : "Login"}
                  </h2>
                </div>
                <div className="grid size-12 place-items-center rounded-full bg-kiaan-soft text-kiaan-pink">
                  {isSignup ? <UserRound size={20} /> : <LockKeyhole size={20} />}
                </div>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {isSignup && (
                  <>
                    <label className="account-field">
                      <UserRound size={17} />
                      <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" autoComplete="name" />
                    </label>
                    <label className="account-field">
                      <Phone size={17} />
                      <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" autoComplete="tel" />
                    </label>
                  </>
                )}

                <label className="account-field">
                  <Mail size={17} />
                  <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" autoComplete="email" />
                </label>

                <label className="account-field">
                  <LockKeyhole size={17} />
                  <input required minLength={6} type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Password" autoComplete={isSignup ? "new-password" : "current-password"} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </label>

                {isSignup && (
                  <label className="account-field account-field-address items-start">
                    <MapPin className="mt-2 shrink-0" size={17} />
                    <textarea required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Delivery address" autoComplete="street-address" rows={2} />
                  </label>
                )}

                {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</div>}
                {notice && <div className="flex items-start gap-2 rounded-xl border border-pink-100 bg-kiaan-soft px-4 py-3 text-sm leading-6 text-kiaan-deep"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{notice}</div>}

                <button disabled={busy || switching} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-kiaan-pink px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-kiaan-deep disabled:cursor-not-allowed disabled:opacity-60">
                  {busy ? "Please wait..." : isSignup ? "SIGN UP" : "LOGIN"}
                  {!busy && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => switchMode(isSignup ? "login" : "signup")}
                  className="font-bold text-kiaan-pink hover:text-kiaan-deep disabled:opacity-50"
                >
                  {isSignup ? "Login" : "Create an Account"}
                </button>
              </div>
              <Link href="/menu" className="mt-5 block text-center text-xs font-bold tracking-wider text-gray-400 hover:text-kiaan-pink">CONTINUE BROWSING MENU</Link>
            </div>
          </section>

          <section className="account-welcome" aria-hidden="true">
            <div className="account-welcome-content">
              <div className="account-mark">K</div>
              <p className="mt-4 text-xs font-bold tracking-[0.28em] text-kiaan-soft">CAFÉ KIAAN</p>
              <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">WELCOME<br />BACK!</h1>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/75">
                {isSignup
                  ? "Create your account once and your order history, phone and delivery address stay ready for your next Café Kiaan order."
                  : "We're glad to see you again. Keep your Café Kiaan orders together and ready across browsers."}
              </p>
            </div>
          </section>

          <div className="account-transition" aria-hidden="true" />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<><Header /><main className="min-h-[720px] bg-kiaan-cream" /><Footer /></>}>
      <AccountContent />
    </Suspense>
  );
}
