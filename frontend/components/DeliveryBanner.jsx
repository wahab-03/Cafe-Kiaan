import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DeliveryBanner() {
  return (
    <section className="relative overflow-hidden bg-kiaan-soft">
      {/* Coffee Leaf Art */}
      <div
        className="pointer-events-none absolute -left-7 top-1/2 z-0 hidden -translate-y-1/2 sm:block"
        aria-hidden="true"
      >
        <svg
          width="210"
          height="180"
          viewBox="0 0 210 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-55"
        >
          {/* Main coffee branch */}
          <path
            d="M8 178C18 151 32 125 53 104C75 81 99 66 128 54C151 45 176 41 202 42"
            stroke="#C987A0"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          <path
            d="M28 143C28 117 32 94 45 72C56 54 71 40 89 29"
            stroke="#C987A0"
            strokeWidth="1.25"
            strokeLinecap="round"
          />

          {/* Leaf 1 */}
          <path
            d="M47 103C34 99 22 90 20 78C33 78 45 86 50 98"
            stroke="#C987A0"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 80C31 86 40 93 48 101"
            stroke="#C987A0"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Leaf 2 */}
          <path
            d="M39 79C27 73 20 63 22 52C34 55 42 64 43 75"
            stroke="#C987A0"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M24 54C30 61 36 69 41 77"
            stroke="#C987A0"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Leaf 3 */}
          <path
            d="M48 68C48 56 54 45 65 40C67 51 61 62 50 69"
            stroke="#C987A0"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M64 42C58 51 54 59 50 67"
            stroke="#C987A0"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Leaf 4 */}
          <path
            d="M71 81C63 72 63 61 70 53C79 60 81 70 75 79"
            stroke="#C987A0"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M70 55C71 64 72 72 74 79"
            stroke="#C987A0"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* Leaf 5 */}
          <path
            d="M87 69C88 57 96 48 108 47C107 58 100 67 89 71"
            stroke="#C987A0"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M106 49C99 55 94 62 89 69"
            stroke="#C987A0"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Leaf 6 */}
          <path
            d="M103 61C97 51 99 41 107 34C115 42 115 52 106 61"
            stroke="#C987A0"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M108 36C106 45 105 53 105 60"
            stroke="#C987A0"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* Leaf 7 */}
          <path
            d="M122 55C121 44 127 35 138 32C140 42 134 51 124 56"
            stroke="#C987A0"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M136 34C131 41 127 48 123 54"
            stroke="#C987A0"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          {/* Right leaves */}
          <path
            d="M144 51C150 42 160 39 170 42C166 51 156 56 146 54"
            stroke="#C987A0"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M168 43C159 46 152 49 146 52"
            stroke="#C987A0"
            strokeWidth="0.85"
            strokeLinecap="round"
          />

          <path
            d="M158 47C159 36 166 29 177 29C178 39 171 47 161 50"
            stroke="#C987A0"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          <path
            d="M175 31C169 37 165 42 161 48"
            stroke="#C987A0"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Small bottom leaves */}
          <path
            d="M29 137C18 133 11 125 12 116C23 118 31 125 33 135"
            stroke="#C987A0"
            strokeWidth="1.15"
            strokeLinecap="round"
          />

          <path
            d="M58 101C52 93 53 85 60 79C67 86 66 94 60 101"
            stroke="#C987A0"
            strokeWidth="1.1"
            strokeLinecap="round"
          />

          {/* Tiny branch */}
          <path
            d="M76 82C87 86 96 93 101 103"
            stroke="#C987A0"
            strokeWidth="1"
            strokeLinecap="round"
          />

          <path
            d="M91 91C99 88 106 90 110 96"
            stroke="#C987A0"
            strokeWidth="1"
            strokeLinecap="round"
          />

          <path
            d="M103 101C101 94 105 89 111 88C113 95 109 101 104 103"
            stroke="#C987A0"
            strokeWidth="1.05"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-5 px-4 py-4 sm:flex-row sm:px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Image
            src="/images/delivery-bike.png"
            alt="Fast delivery"
            width={150}
            height={100}
            className="shrink-0 object-contain"
          />

          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-72">
              <h3 className="font-serif text-xl font-bold leading-tight text-kiaan-ink sm:text-2xl">
                FAST DELIVERY
                <br />
                AT YOUR DOORSTEP
              </h3>

              <p className="text-base leading-6 text-kiaan-ink/70 sm:mt-1 sm:max-w-[242px]">
                Order online & enjoy your favourite food and coffee at home.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/menu"
            className="flex shrink-0 items-center gap-2 rounded-full bg-kiaan-pink px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            Order Online
            <ArrowRight size={16} />
          </Link>

          <Image
            src="/images/coffee-decor.png"
            alt=""
            aria-hidden="true"
            width={150}
            height={150}
            className="pointer-events-none hidden h-[150px] w-[150px] shrink-0 object-contain sm:block"
          />
        </div>
      </div>
    </section>
  );
}

