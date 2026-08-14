import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "warning" | "danger" | "success";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted-foreground",
  brand: "bg-brand/15 text-brand",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger/15 text-danger",
  success: "bg-brand/15 text-brand",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export const CONSULTATION_STATUS_TONE: Record<string, BadgeTone> = {
  planifie: "neutral",
  confirme: "brand",
  termine: "success",
  annule: "danger",
  absent: "warning",
};

export const INVOICE_STATUS_TONE: Record<string, BadgeTone> = {
  brouillon: "neutral",
  emise: "brand",
  payee: "success",
  annulee: "danger",
};
