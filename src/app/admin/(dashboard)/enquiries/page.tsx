import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { updateEnquiryStatus } from "@/app/admin/actions";

export const metadata = { title: "Admin — enquiries", robots: { index: false } };

export default async function AdminEnquiries() {
  const enquiries = await db.enquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Enquiries ({enquiries.length})</h1>
      {enquiries.length === 0 ? (
        <EmptyState label="No enquiries yet" message="The contact form feeds this inbox." />
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl">
          {enquiries.map((e) => (
            <article key={e.id} className="border border-ivory/15 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{e.subject}</p>
                  <p className="label opacity-50 mt-1">
                    {e.name} · {e.email}
                    {e.phone ? ` · ${e.phone}` : ""} · {formatDate(e.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`label border px-2.5 py-1 ${
                      e.status === "new"
                        ? "border-citron/60 text-citron"
                        : e.status === "answered"
                          ? "border-champagne/60 text-champagne"
                          : "border-ivory/30 opacity-60"
                    }`}
                  >
                    {e.status}
                  </span>
                  {["new", "answered", "closed"]
                    .filter((s) => s !== e.status)
                    .map((s) => (
                      <form key={s} action={updateEnquiryStatus}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="status" value={s} />
                        <button type="submit" className="label opacity-50 hover:opacity-100 cursor-pointer px-1">
                          → {s}
                        </button>
                      </form>
                    ))}
                </div>
              </div>
              <p className="mt-3 text-sm opacity-75 whitespace-pre-line">{e.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
