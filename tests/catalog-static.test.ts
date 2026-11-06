import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  staticAllProducts,
  staticCollection,
  staticCollections,
  staticFilterOptions,
  staticProduct,
  staticProducts,
  staticProductsBySlugs,
} from "../src/lib/catalog-static";

describe("static catalogue", () => {
  it("serves the whole demo catalogue, featured designs first", () => {
    const all = staticAllProducts();
    assert.equal(all.length, 28);
    const firstNonFeatured = all.findIndex((p) => !p.featured);
    assert.ok(all.slice(firstNonFeatured).every((p) => !p.featured), "featured designs come first");
  });

  it("searches case-insensitively across names, descriptions and collections", () => {
    for (const q of ["marble", "MARBLE", "Marble"]) {
      const names = staticProducts({ q, perPage: 50 }).products.map((p) => p.name);
      assert.ok(names.includes("Celestial Marble"), `“${q}” finds Celestial Marble`);
    }
    // collection-name match: every Marble Archive design is found by its collection's name
    const archive = staticProducts({ q: "the marble archive", perPage: 50 }).products;
    assert.ok(archive.length >= 3);
    assert.equal(staticProducts({ q: "no-such-design-xyz" }).total, 0);
  });

  it("filters by collection, colour and price", () => {
    const botanical = staticProducts({ collection: "botanical", perPage: 50 }).products;
    assert.ok(botanical.length > 0 && botanical.every((p) => p.collectionSlug === "botanical"));
    const green = staticProducts({ color: "Green", perPage: 50 }).products;
    assert.ok(green.length > 0 && green.every((p) => p.colorFamily.includes("Green")));
    const cheap = staticProducts({ maxPrice: 3500, perPage: 50 }).products;
    assert.ok(cheap.length > 0 && cheap.every((p) => p.price <= 3500));
  });

  it("sorts and paginates", () => {
    const asc = staticProducts({ sort: "price-asc", perPage: 50 }).products.map((p) => p.price);
    assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
    const desc = staticProducts({ sort: "price-desc", perPage: 50 }).products.map((p) => p.price);
    assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
    const newest = staticProducts({ sort: "newest", perPage: 50 }).products;
    const firstOld = newest.findIndex((p) => !p.newArrival);
    assert.ok(newest.slice(firstOld).every((p) => !p.newArrival), "new arrivals come first");

    const page1 = staticProducts({ page: 1, perPage: 12 });
    const page3 = staticProducts({ page: 3, perPage: 12 });
    assert.equal(page1.total, 28);
    assert.equal(page1.pages, 3);
    assert.equal(page1.products.length, 12);
    assert.equal(page3.products.length, 4);
  });

  it("serves collections with counts and popularity-ordered products", () => {
    const cols = staticCollections();
    assert.equal(cols.length, 10);
    assert.equal(cols.reduce((n, c) => n + (c.productCount ?? 0), 0), 28);
    const botanical = staticCollection("botanical")!;
    const pop = botanical.products.map((p) => p.popularity);
    assert.deepEqual(pop, [...pop].sort((a, b) => b - a));
    assert.equal(staticCollection("no-such-collection"), null);
  });

  it("keeps the catalogue internally consistent", () => {
    for (const p of staticAllProducts()) {
      assert.ok(existsSync(join(process.cwd(), "public", p.texture)), `${p.slug}: texture file exists`);
      const related = staticProductsBySlugs(p.relatedSlugs);
      assert.equal(related.length, p.relatedSlugs.length, `${p.slug}: every related design exists`);
    }
    assert.equal(staticProduct("midnight-garden")?.name, "Midnight Garden");
    assert.equal(staticProduct("nope"), null);
    const opts = staticFilterOptions();
    assert.ok(opts.minPrice > 0 && opts.maxPrice >= opts.minPrice);
  });
});
