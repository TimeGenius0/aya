import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderInvoicePdf } from "@/lib/invoices/generatePdf";

// @react-pdf/renderer needs Node APIs — this route can't run on the Edge runtime.
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { invoiceId } = await params;
  const result = await renderInvoicePdf(invoiceId);
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${result.invoiceNumber}.pdf"`,
    },
  });
}
