import { z } from "zod";

/** Shared pagination/search input, reused by list_* MCP tools and list pages. */
export const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

/** Empty string from an <input> is "no value", not literally the string "". */
export const emptyToNull = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? null : val;

export const optionalTrimmedString = z.preprocess(
  emptyToNull,
  z.string().trim().min(1).nullable().optional()
);
