import { prisma } from "@/lib/prisma";
import type { CreateNoteInput } from "@/lib/schemas/note";

export async function getNote(noteId: string) {
  return prisma.note.findUnique({
    where: { id: noteId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      animal: { include: { client: true } },
      consultation: true,
      author: true,
      invoices: true,
    },
  });
}

export async function createNote(input: CreateNoteInput, authorId: string | null) {
  return prisma.note.create({
    data: {
      animalId: input.animalId,
      consultationId: input.consultationId ?? null,
      authorId,
      freeText: input.freeText ?? null,
      lineItems: {
        create: input.lineItems.map((item, index) => ({
          kind: item.kind,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: index,
        })),
      },
    },
    include: { lineItems: true },
  });
}
