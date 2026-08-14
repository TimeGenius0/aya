import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import * as clientsData from "@/lib/data/clients";
import * as animalsData from "@/lib/data/animals";
import * as notesData from "@/lib/data/notes";
import * as consultationsData from "@/lib/data/consultations";
import * as invoicesData from "@/lib/data/invoices";

import { createClientSchema, updateClientSchema } from "@/lib/schemas/client";
import { createAnimalSchema, updateAnimalSchema } from "@/lib/schemas/animal";
import { createNoteSchema } from "@/lib/schemas/note";
import { createConsultationSchema, updateConsultationSchema } from "@/lib/schemas/consultation";
import { generateInvoiceSchema } from "@/lib/schemas/invoice";
import { listQuerySchema } from "@/lib/schemas/common";

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(err: unknown): ToolResult {
  const message = err instanceof Error ? err.message : "Erreur inattendue.";
  return { content: [{ type: "text", text: `Erreur : ${message}` }], isError: true };
}

/** Wraps a tool handler so any thrown error becomes an MCP tool error instead of a transport failure. */
function safe<Args>(fn: (args: Args) => Promise<unknown>) {
  return async (args: Args): Promise<ToolResult> => {
    try {
      return ok(await fn(args));
    } catch (err) {
      return fail(err);
    }
  };
}

/**
 * Registers every MCP tool on a freshly-constructed server (one per request
 * — see src/pages/api/mcp.ts). `staffId` is the staff member the calling API
 * key was issued to, if any — used for created_by attribution.
 */
export function registerTools(server: McpServer, ctx: { staffId: string | null }) {
  server.registerTool(
    "list_clients",
    {
      title: "Lister les clients",
      description: "Recherche et liste les clients du cabinet, avec pagination.",
      inputSchema: listQuerySchema.shape,
    },
    safe(async (args) => clientsData.listClients(args))
  );

  server.registerTool(
    "get_client",
    {
      title: "Obtenir un client",
      description: "Retourne un client et la liste de ses animaux.",
      inputSchema: { clientId: z.string().uuid() },
    },
    safe(async ({ clientId }) => {
      const client = await clientsData.getClient(clientId);
      if (!client) throw new Error("Client introuvable.");
      return client;
    })
  );

  server.registerTool(
    "create_client",
    {
      title: "Créer un client",
      description: "Crée une nouvelle fiche client (propriétaire d'animaux).",
      inputSchema: createClientSchema.shape,
    },
    safe(async (args) => clientsData.createClient(createClientSchema.parse(args), ctx.staffId))
  );

  server.registerTool(
    "update_client",
    {
      title: "Modifier un client",
      description: "Met à jour les informations de contact d'un client existant.",
      inputSchema: updateClientSchema.shape,
    },
    safe(async (args) => clientsData.updateClient(updateClientSchema.parse(args)))
  );

  server.registerTool(
    "list_animals_for_client",
    {
      title: "Lister les animaux d'un client",
      description: "Retourne tous les animaux appartenant à un client.",
      inputSchema: { clientId: z.string().uuid() },
    },
    safe(async ({ clientId }) => animalsData.listAnimalsForClient(clientId))
  );

  server.registerTool(
    "get_animal",
    {
      title: "Obtenir un animal",
      description: "Retourne un animal avec son client, ses notes et ses consultations.",
      inputSchema: { animalId: z.string().uuid() },
    },
    safe(async ({ animalId }) => {
      const animal = await animalsData.getAnimal(animalId);
      if (!animal) throw new Error("Animal introuvable.");
      return animal;
    })
  );

  server.registerTool(
    "create_animal",
    {
      title: "Ajouter un animal",
      description: "Ajoute un animal au dossier d'un client (espèce libre, attributs additionnels flexibles).",
      inputSchema: createAnimalSchema.shape,
    },
    safe(async (args) => animalsData.createAnimal(createAnimalSchema.parse(args)))
  );

  server.registerTool(
    "update_animal",
    {
      title: "Modifier un animal",
      description: "Met à jour la fiche d'un animal existant.",
      inputSchema: updateAnimalSchema.shape,
    },
    safe(async (args) => animalsData.updateAnimal(updateAnimalSchema.parse(args)))
  );

  server.registerTool(
    "add_treatment_note",
    {
      title: "Ajouter une note de traitement",
      description:
        "Ajoute une note à un animal (compte-rendu libre + lignes de traitements/produits, base d'une future facture).",
      inputSchema: createNoteSchema.shape,
    },
    safe(async (args) => notesData.createNote(createNoteSchema.parse(args), ctx.staffId))
  );

  server.registerTool(
    "get_note",
    {
      title: "Obtenir une note",
      description: "Retourne une note de traitement avec ses lignes, l'animal et le client concernés.",
      inputSchema: { noteId: z.string().uuid() },
    },
    safe(async ({ noteId }) => {
      const note = await notesData.getNote(noteId);
      if (!note) throw new Error("Note introuvable.");
      return note;
    })
  );

  server.registerTool(
    "list_consultations",
    {
      title: "Lister les consultations",
      description: "Liste les consultations, filtrable par période, client, animal ou statut.",
      inputSchema: {
        from: z.string().optional(),
        to: z.string().optional(),
        clientId: z.string().uuid().optional(),
        animalId: z.string().uuid().optional(),
        status: z.string().optional(),
      },
    },
    safe(async (args) =>
      consultationsData.listConsultations({
        ...args,
        from: args.from ? new Date(args.from) : undefined,
        to: args.to ? new Date(args.to) : undefined,
      })
    )
  );

  server.registerTool(
    "get_calendar",
    {
      title: "Obtenir le calendrier",
      description: "Retourne les consultations planifiées entre deux dates (vue calendrier).",
      inputSchema: { from: z.string(), to: z.string() },
    },
    safe(async ({ from, to }) =>
      consultationsData.listConsultations({ from: new Date(from), to: new Date(to) })
    )
  );

  server.registerTool(
    "create_consultation",
    {
      title: "Planifier une consultation",
      description: "Ajoute une consultation au calendrier pour un client et un animal.",
      inputSchema: createConsultationSchema.shape,
    },
    safe(async (args) =>
      consultationsData.createConsultation(createConsultationSchema.parse(args), ctx.staffId)
    )
  );

  server.registerTool(
    "update_consultation",
    {
      title: "Modifier une consultation",
      description: "Met à jour une consultation existante (horaire, motif, statut…).",
      inputSchema: updateConsultationSchema.shape,
    },
    safe(async (args) => consultationsData.updateConsultation(updateConsultationSchema.parse(args)))
  );

  server.registerTool(
    "generate_invoice",
    {
      title: "Générer une facture",
      description: "Génère une facture à partir des lignes (traitements/produits) d'une note.",
      inputSchema: generateInvoiceSchema.shape,
    },
    safe(async (args) => {
      const { noteId, taxRate } = generateInvoiceSchema.parse(args);
      return invoicesData.generateInvoiceFromNote(noteId, taxRate, ctx.staffId);
    })
  );

  server.registerTool(
    "get_invoice",
    {
      title: "Obtenir une facture",
      description: "Retourne une facture avec ses lignes.",
      inputSchema: { invoiceId: z.string().uuid() },
    },
    safe(async ({ invoiceId }) => {
      const invoice = await invoicesData.getInvoice(invoiceId);
      if (!invoice) throw new Error("Facture introuvable.");
      return invoice;
    })
  );

  server.registerTool(
    "list_invoices",
    {
      title: "Lister les factures",
      description: "Liste les factures, filtrable par client ou statut.",
      inputSchema: {
        clientId: z.string().uuid().optional(),
        status: z.string().optional(),
        limit: z.coerce.number().int().positive().max(200).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      },
    },
    safe(async (args) => invoicesData.listInvoices(args))
  );
}
