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
  rne: string;
  address: string;
  city: string;
  postal_code: string;
  signatory_name: string;
  signatory_title: string;
  logo_url: string;
  google_sheet_id: string;
}
