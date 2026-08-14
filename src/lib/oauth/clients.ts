import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/crypto";

export async function registerOAuthClient(input: { clientName?: string; redirectUris: string[] }) {
  const clientId = randomToken("ayh_client_", 16);
  return prisma.oAuthClient.create({
    data: { clientId, clientName: input.clientName ?? null, redirectUris: input.redirectUris },
  });
}

export async function getOAuthClient(clientId: string) {
  return prisma.oAuthClient.findUnique({ where: { clientId } });
}
