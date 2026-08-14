import { prisma } from "@/lib/prisma";
import { randomToken, sha256Hex } from "@/lib/crypto";

// Authorization codes are meant to be exchanged within seconds of issuance —
// 5 minutes is generous slack, not a working session length.
const CODE_TTL_MS = 5 * 60 * 1000;

export async function createAuthorizationCode(input: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  staffId: string;
}) {
  const raw = randomToken("ayh_code_", 24);
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: sha256Hex(raw),
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      codeChallenge: input.codeChallenge,
      codeChallengeMethod: input.codeChallengeMethod,
      staffId: input.staffId,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  return raw;
}

/** Single-use: atomically marks the code used so it can't be replayed. */
export async function consumeAuthorizationCode(raw: string) {
  const hash = sha256Hex(raw);
  const record = await prisma.oAuthAuthorizationCode.findUnique({ where: { codeHash: hash } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;

  const { count } = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (count === 0) return null; // lost a race with a concurrent exchange of the same code

  return record;
}
