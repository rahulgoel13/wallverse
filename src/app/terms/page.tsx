import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The terms that govern purchases and use of the WALLVERSE website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="section-dark min-h-dvh pb-24">
      <PageHero eyebrow="Terms" title="The agreement." texture="/textures/stone-strata.svg" />
      <div className="container-wv mt-14 prose-wv">
        <p>
          Template terms for the {site.name} demonstration store. Adapt with legal advice before
          trading.
        </p>
        <h2>The store</h2>
        <p>
          {site.name} currently operates as a demonstration: products, prices and policies are
          sample data, demo orders create no obligation on either side, and no real payment is taken
          in demo payment mode.
        </p>
        <h2>Orders & pricing</h2>
        <ul>
          <li>All prices are in Indian Rupees and include GST unless stated otherwise.</li>
          <li>An order is accepted when we confirm dispatch, not when payment is taken.</li>
          <li>Obvious pricing errors may be corrected before dispatch with a full refund offered.</li>
        </ul>
        <h2>Colour & pattern accuracy</h2>
        <p>
          Screens differ. We render textures faithfully, but the printed roll is the reference —
          order an A4 sample before committing to a full wall. Batch-to-batch variation is normal in
          printed wallcoverings.
        </p>
        <h2>The calculator</h2>
        <p>
          Roll estimates are calculated from the measurements you enter and stated assumptions. They
          are a planning aid, not a quotation; wall condition and layout can change the final count.
        </p>
        <h2>Intellectual property</h2>
        <p>
          All designs, texture assets, text and the three-dimensional experiences on this site
          belong to {site.name} and may not be reproduced without permission.
        </p>
        <h2>Liability</h2>
        <p>
          Nothing in these terms limits rights you hold under Indian consumer law. We are not liable
          for installation work carried out by third parties.
        </p>
      </div>
    </div>
  );
}
