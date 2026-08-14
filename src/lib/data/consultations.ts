import { prisma } from "@/lib/prisma";
import type { CreateConsultationInput, UpdateConsultationInput } from "@/lib/schemas/consultation";
import type { Prisma } from "@prisma/client";

export async function listConsultations(opts: {
  from?: Date;
  to?: Date;
  clientId?: string;
  animalId?: string;
  status?: string;
}) {
  const where: Prisma.ConsultationWhereInput = {};
  if (opts.from || opts.to) {
    where.scheduledAt = {
      ...(opts.from && { gte: opts.from }),
      ...(opts.to && { lte: opts.to }),
    };
  }
  if (opts.clientId) where.clientId = opts.clientId;
  if (opts.animalId) where.animalId = opts.animalId;
  if (opts.status) where.status = opts.status;

  return prisma.consultation.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: { client: true, animal: true },
  });
}

export async function getConsultation(consultationId: string) {
  return prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      client: true,
      animal: true,
      notes: { orderBy: { createdAt: "desc" }, include: { lineItems: true } },
    },
  });
}

export async function createConsultation(input: CreateConsultationInput, staffId: string | null) {
  return prisma.consultation.create({
    data: {
      clientId: input.clientId,
      animalId: input.animalId,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes,
      reason: input.reason ?? null,
      status: input.status,
      createdBy: staffId,
    },
    include: { client: true, animal: true },
  });
}

export async function updateConsultation(input: UpdateConsultationInput) {
  const { consultationId, ...fields } = input;
  const data: Prisma.ConsultationUpdateInput = { updatedAt: new Date() };

  if (fields.clientId !== undefined) data.client = { connect: { id: fields.clientId } };
  if (fields.animalId !== undefined) data.animal = { connect: { id: fields.animalId } };
  if (fields.scheduledAt !== undefined) data.scheduledAt = new Date(fields.scheduledAt);
  if (fields.durationMinutes !== undefined) data.durationMinutes = fields.durationMinutes;
  if (fields.reason !== undefined) data.reason = fields.reason;
  if (fields.status !== undefined) data.status = fields.status;

  return prisma.consultation.update({
    where: { id: consultationId },
    data,
    include: { client: true, animal: true },
  });
}
