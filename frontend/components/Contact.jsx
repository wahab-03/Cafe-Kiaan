import SectionHeading from "./SectionHeading";
import { MapPin, Phone, Mail, Clock3, Navigation, MessageCircle } from "lucide-react";

const homeContact = {
  phone: "01780843477",
  email: "cafekiaan@gmail.com",
};

const dedicatedContact = {
  phone: "0178083453",
  email: "resturent@gmail.com",
  hours: "10:00 AM to 11:00 PM",
};

const contactIntro = "Have a question about our menu, an upcoming order, or a special request? We’d love to hear from you and help make your Café Kiaan experience even better. Whether you want to ask about our dishes, share your feedback, or simply say hello, our team is always happy to connect with you. Reach out using the contact details below and we’ll be glad to assist you.";

export default function Contact({ dedicated = false }) {
  const details = dedicated ? dedicatedContact : homeContact;

  return <section id={dedicated ? undefined : "contact"} className="scroll-mt-28 py-8 sm:py-10 bg-[#FFF9F6]">
    <div className="max-w-[1600px] mx-auto px-5">
      <SectionHeading eyebrow="CONTACT CAFÉ KIAAN" title="We’d Love to Hear From You" />

      {dedicated ? (
        <>
          <div className="mt-[-1.5rem] mb-4 text-center text-kiaan-pink" aria-hidden="true">✦</div>
          <div className="max-w-3xl mt-5 text-sm leading-7 text-gray-500">
            {contactIntro}
          </div>
        </>
      ) : null}

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6 mt-9">
        <div className="bg-[#FBF6F2] rounded-2xl p-7 border border-[#EDE2DC] shadow-[0_2px_10px_rgba(90,50,35,0.04)]">
          <h2 className="font-serif text-2xl font-bold text-kiaan-ink">Get in touch</h2>
          <p className="mt-2 text-base leading-6 text-gray-500">
            {dedicated
              ? "We’re here to help with menu questions, orders, feedback and other restaurant inquiries."
              : "Questions about the menu, an order, or your next visit? Get in touch with Café Kiaan."}
          </p>
          <div className="mt-7 space-y-5">
            <div className="flex gap-4"><MapPin className="text-kiaan-pink shrink-0" /><div><b className="text-lg">Zindabazar, Sylhet</b><p className="text-sm text-gray-500 mt-1">Bangladesh</p></div></div>
            <div className="flex gap-4"><Phone className="text-kiaan-pink shrink-0" /><div className="min-w-0"><b className="text-lg">Phone</b><p className="text-sm text-gray-600 mt-1 break-all">{details.phone}</p></div></div>
            <div className="flex gap-4"><Mail className="text-kiaan-pink shrink-0" /><div className="min-w-0"><b className="text-lg">Email</b><p className="text-sm text-gray-600 mt-1 break-all">{details.email}</p></div></div>
            {dedicated ? (
              <div className="flex gap-4"><Clock3 className="text-kiaan-pink shrink-0" /><div><b>Opening Hours</b ><p className="text-sm text-gray-600 mt-1">{details.hours}</p></div></div>
            ) : null}
            <div className="flex gap-4"><MessageCircle className="text-kiaan-pink shrink-0" /><div><b className="text-lg">Order & inquiry help</b><p className="text-base text-gray-500 mt-1">For order questions, keep your Odoo order number available when contacting the restaurant.</p></div></div>
          </div>
        </div>
        <div className="h-full min-h-80 rounded-2xl overflow-hidden border bg-gray-200 shadow-sm">
          <iframe title="Café Kiaan map" src="https://www.openstreetmap.org/export/embed.html?bbox=91.860%2C24.885%2C91.890%2C24.905&layer=mapnik" className="w-full h-full min-h-80 border-0" />
        </div>
      </div>
      <a href="https://www.google.com/maps/search/?api=1&query=Zindabazar%2C%20Sylhet%2C%20Bangladesh" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 bg-kiaan-pink text-white px-6 py-3 rounded-full text-[15px] font-bold"><Navigation size={14} /> GET DIRECTIONS</a>
    </div>
  </section>;
}
