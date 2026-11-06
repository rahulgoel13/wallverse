import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/site";
import { usesDatabase } from "@/lib/data-source";

export const metadata: Metadata = {
  title: "Contact the studio",
  description: "Questions about designs, samples, measurement or installation — talk to WALLVERSE.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero
        eyebrow="Contact"
        title="Talk to the studio."
        copy="Measurement doubts, sample requests, trade enquiries or installation questions — write to us and a human answers."
        texture="/textures/limestone-weave.svg"
      />
      <div className="container-wv mt-16 grid gap-14 lg:grid-cols-[1.5fr_1fr] items-start">
        {/* Without a database there is nowhere to store an enquiry: hand it to the visitor's email app. */}
        <ContactForm emailTo={usesDatabase ? undefined : site.email} />
        <aside className="border border-ivory/15 p-7 flex flex-col gap-6" aria-label="Studio details">
          <div>
            <p className="label opacity-50 mb-2">Studio</p>
            <p className="text-sm opacity-80 leading-relaxed">{site.address}</p>
          </div>
          <div>
            <p className="label opacity-50 mb-2">Email</p>
            <p className="text-sm opacity-80">{site.email}</p>
          </div>
          <div>
            <p className="label opacity-50 mb-2">Phone</p>
            <p className="text-sm opacity-80">{site.phone}</p>
          </div>
          <div>
            <p className="label opacity-50 mb-2">Hours</p>
            <p className="text-sm opacity-80 leading-relaxed">
              Monday – Saturday, 10:00 – 19:00 IST
            </p>
          </div>
          <p className="text-xs opacity-50 border-t border-ivory/15 pt-5">
            Demonstration configuration — contact details are placeholders until the final brand
            goes live.
          </p>
        </aside>
      </div>
    </div>
  );
}
