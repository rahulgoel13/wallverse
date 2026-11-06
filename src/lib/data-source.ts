/**
 * Where the store reads and writes its data.
 *
 * "static" (default): the catalogue, collections, journal and coupons come from
 * the files in src/data — no database or environment variables needed. Pages
 * are identical; things that would save data (orders, enquiries, admin edits)
 * degrade honestly: demo orders stay in the visitor's browser, enquiries open
 * the visitor's email app, and the admin explains it needs a database.
 *
 * "database": everything is read from and written to PostgreSQL through Prisma
 * (set DATA_SOURCE=database plus DATABASE_URL / DATABASE_URL_UNPOOLED).
 */
export const usesDatabase = process.env.DATA_SOURCE === "database";
