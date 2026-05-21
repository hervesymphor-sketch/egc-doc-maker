import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Student, Promotion } from "./types";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

const SHEET_TAB: Record<Promotion, string> = {
  "1": "Promotion 1",
  "2": "Promotion 2",
  "3": "Promotion 3",
};

async function fetchSheetValues(spreadsheetId: string, range: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY missing");

  const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${range}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Google Sheets error [${res.status}]: ${JSON.stringify(data).slice(0, 300)}`,
    );
  }
  return data as { values?: string[][] };
}

function rowToStudent(row: string[], promotion: Promotion, index: number): Student {
  const cell = (i: number) => (row[i] ?? "").trim();
  return {
    id: `P${promotion}-${index + 1}`,
    promotion,
    prenom: cell(0),
    nom: cell(1),
    dateNaissance: cell(2),
    lieuNaissance: cell(3),
    ine: cell(4),
    numIdentification: cell(5),
    numEtudiant: cell(6),
    adresse: cell(7),
    groupe: cell(8),
    photo: cell(9),
    anneeUniversitaire: cell(10),
  };
}

export const getStudents = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        spreadsheetId: z.string().min(10).max(200),
        promotion: z.enum(["1", "2", "3"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const promos: Promotion[] = data.promotion ? [data.promotion] : ["1", "2", "3"];
    const all: Student[] = [];
    const errors: string[] = [];
    for (const promo of promos) {
      try {
        const range = `'${SHEET_TAB[promo]}'!A2:K500`;
        const result = await fetchSheetValues(data.spreadsheetId, range);
        const rows = result.values ?? [];
        rows.forEach((row, i) => {
          if (row && row[0] && row[0].trim()) {
            all.push(rowToStudent(row, promo, i));
          }
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`Promotion ${promo}: ${msg}`);
      }
    }
    return { students: all, errors };
  });
