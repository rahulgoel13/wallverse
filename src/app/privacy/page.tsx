import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How WALLVERSE handles personal data: what is collected, why, and your choices.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero eyebrow="Privacy" title="Your data, plainly." texture="/textures/quiet-plaster.svg" />
      <div className="container-wv mt-14 prose-wv">
        <p>
          This is a template privacy policy for the {site.name} demonstration store. Review and
          adapt it with legal advice before commercial use.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Order details you provide at checkout: name, email, phone, delivery address.</li>
          <li>Enquiries you send through the contact form.</li>
          <li>Preferences stored only in your browser: cart, wishlist, saved room designs and recently viewed items. These never leave your device unless you place an order.</li>
        </ul>
        <h2>What we use it for</h2>
        <ul>
          <li>Fulfilling and supporting your orders.</li>
          <li>Replying to enquiries.</li>
          <li>Nothing else — we do not sell or share personal data for advertising.</li>
        </ul>
        <h2>Room photos</h2>
        <p>
          Photos you add in the Room Studio are kept in your browser session only. They are never
          uploaded to our servers.
        </p>
        <h2>Payments</h2>
        <p>
          When online payment is enabled it is processed by Razorpay; card and banking details go
          directly to the payment provider and never touch our servers. In demo mode no payment
          data exists at all.
        </p>
        <h2>Retention & your rights</h2>
        <p>
          Order records are kept as long as required for accounting. You can request a copy or
          deletion of your personal data by writing to {site.email}.
        </p>
      </div>
    </div>
  );
}
