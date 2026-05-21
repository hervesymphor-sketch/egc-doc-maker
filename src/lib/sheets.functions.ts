import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Student, Promotion } from "./types";

const SHEETS_API_URL = "https://sheets.googleapis.com/v4";
const SHEETS_GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

const SHEET_TAB: Record<Promotion, string> = {
  "1": "Promotion 1",
  "2": "Promotion 2",
  "3": "Promotion 3",
};

async function getGoogleAccessToken() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !rawPrivateKey) return null;

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const toBase64Url = (input: string | ArrayBuffer) =>
    Buffer.from(input instanceof ArrayBuffer ? new Uint8Array(input) : input)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const pem = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const keyData = Uint8Array.from(Buffer.from(pem, "base64"));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken));
  const assertion = `${unsignedToken}.${toBase64Url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const token = await res.json();
  if (!res.ok) {
    throw new Error(`Google service account error [${res.status}]: ${JSON.stringify(token).slice(0, 300)}`);
  }
  return token.access_token as string;
}

async function fetchSheetValues(spreadsheetId: string, range: string) {
  const gatewayApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const rangePath = range.replaceAll(" ", "%20");

  if (gatewayApiKey && lovableApiKey) {
    const gatewayUrl = `${SHEETS_GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${rangePath}`;
    const res = await fetch(gatewayUrl, {
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": gatewayApiKey,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Google Sheets connector error [${res.status}]: ${JSON.stringify(data).slice(0, 300)}`,
      );
    }
    return data as { values?: string[][] };
  }

  const accessToken = await getGoogleAccessToken();
  if (accessToken) {
    const url = `${SHEETS_API_URL}/spreadsheets/${spreadsheetId}/values/${rangePath}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `Google Sheets service account error [${res.status}]: ${JSON.stringify(data).slice(0, 300)}`,
      );
    }
    return data as { values?: string[][] };
  }

  if (!googleApiKey) throw new Error("Google Sheets connection missing");

  const url = `${SHEETS_API_URL}/spreadsheets/${spreadsheetId}/values/${rangePath}?key=${googleApiKey}`;
  const res = await fetch(url);
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
