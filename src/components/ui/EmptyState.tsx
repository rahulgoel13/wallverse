import type { ReactNode } from "react";

export function EmptyState({
  label,
  message,
  action,
}: {
  label: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-current/15 px-8 py-20 text-center flex flex-col items-center gap-4">
      <p className="label opacity-50">{label}</p>
      <p className="font-serif text-2xl md:text-3xl max-w-md text-balance">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
