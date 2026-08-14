// Shared data-layer for clients — called from both Server Actions (pages)
// and MCP tools, so the two surfaces can never drift apart. Every function
// here assumes the caller already authenticated (requireStaff() for pages,
// the bearer API key for MCP) — Prisma connects with a role that bypasses
// RLS, so this module *is* the authorization boundary, not the database.

import { prisma } from "@/lib/prisma";
import type { CreateClientInput, UpdateClientInput } from "@/lib/schemas/client";

export async function listClients(opts: { search?: string; limit?: number; offset?: number }) {
  const { search, limit = 50, offset = 0 } = opts;

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { fullName: "asc" },
      take: limit,
      skip: offset,
      include: { _count: { select: { animals: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return { clients, total };
}

export async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      animals: { orderBy: { name: "asc" } },
    },
  });
}

export async function createClient(input: CreateClientInput, staffId: string | null) {
  return prisma.client.create({
    data: {
      fullName: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
      createdBy: staffId,
    },
  });
}

export async function updateClient(input: UpdateClientInput) {
  const { clientId, ...fields } = input;
  return prisma.client.update({
    where: { id: clientId },
    data: { ...fields, updatedAt: new Date() },
  });
}
