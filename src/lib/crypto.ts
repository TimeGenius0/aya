import { randomBytes, createHash } from "node:crypto";

/** SHA-256 hex digest — used everywhere a secret is stored (never the raw value). */
export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(prefix: string, bytes = 24) {
  return `${prefix}${randomBytes(bytes).toString("hex")}`;
}
