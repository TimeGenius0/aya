import { prisma } from "@/lib/prisma";
import type { CreateAnimalInput, UpdateAnimalInput } from "@/lib/schemas/animal";
import type { Prisma } from "@prisma/client";

export async function listAnimalsForClient(clientId: string) {
  return prisma.animal.findMany({ where: { clientId }, orderBy: { name: "asc" } });
}

export async function getAnimal(animalId: string) {
  return prisma.animal.findUnique({
    where: { id: animalId },
    include: {
      client: true,
      notesEntries: {
        orderBy: { createdAt: "desc" },
        include: { lineItems: true, author: true },
      },
      consultations: { orderBy: { scheduledAt: "desc" } },
    },
  });
}

export async function createAnimal(input: CreateAnimalInput) {
  return prisma.animal.create({
    data: {
      clientId: input.clientId,
      name: input.name,
      species: input.species,
      breed: input.breed ?? null,
      sex: input.sex ?? null,
      birthdate: input.birthdate ? new Date(input.birthdate) : null,
      approxAgeYears: input.approxAgeYears ?? null,
      weightKg: input.weightKg ?? null,
      notes: input.notes ?? null,
      attributes: (input.attributes ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function updateAnimal(input: UpdateAnimalInput) {
  const { animalId, ...fields } = input;
  const data: Prisma.AnimalUpdateInput = { updatedAt: new Date() };

  if (fields.name !== undefined) data.name = fields.name;
  if (fields.species !== undefined) data.species = fields.species;
  if (fields.breed !== undefined) data.breed = fields.breed;
  if (fields.sex !== undefined) data.sex = fields.sex;
  if (fields.birthdate !== undefined) {
    data.birthdate = fields.birthdate ? new Date(fields.birthdate) : null;
  }
  if (fields.approxAgeYears !== undefined) data.approxAgeYears = fields.approxAgeYears;
  if (fields.weightKg !== undefined) data.weightKg = fields.weightKg;
  if (fields.notes !== undefined) data.notes = fields.notes;
  if (fields.attributes !== undefined) data.attributes = fields.attributes as Prisma.InputJsonValue;

  return prisma.animal.update({ where: { id: animalId }, data });
}
