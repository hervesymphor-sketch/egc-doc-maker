export type Promotion = "1" | "2" | "3";

export interface Student {
  id: string; // synthesized from promotion + row index
  promotion: Promotion;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  adresse: string;
  ville: string;
  codePostal: string;
  email: string;
  telephone: string;
  photo: string;
}

export interface SchoolSettings {
  id: string;
  name: string;
  rne: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  signatory_name: string | null;
  signatory_title: string | null;
  logo_url: string | null;
  google_sheet_id: string | null;
}
