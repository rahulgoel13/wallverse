import Link from "next/link";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All designs" },
      { href: "/collections", label: "Collections" },
      { href: "/room-studio", label: "Room Studio" },
      { href: "/calculator", label: "Roll calculator" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "Our world" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "Contact" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/installation", label: "Installation guide" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="section-dark border-t border-ivory/10">
      <div className="container-wv py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-serif text-3xl tracking-[0.3em]">{site.name}</p>
            <p className="mt-4 max-w-xs text-sm opacity-60 leading-relaxed">{site.tagline}</p>
            <p className="label mt-8 opacity-40">{site.address}</p>
            <p className="label mt-2 opacity-40">{site.email}</p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="label opacity-50 mb-5">{col.title}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm opacity-75 hover:opacity-100 hover:text-citron transition-all"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-ivory/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="label opacity-40">
            © {new Date().getFullYear()} {site.name}. A demonstration storefront.
          </p>
          <p className="label opacity-40">Made of walls, light and mathematics.</p>
        </div>
      </div>
    </footer>
  );
}
