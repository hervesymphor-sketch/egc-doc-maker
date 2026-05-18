import type { Student, SchoolSettings } from "@/lib/types";
import logoEgc from "@/assets/logo-egc.png";

interface EmargementProps {
  students: Student[];
  settings: SchoolSettings;
  date: string;
  matiere: string;
  enseignant: string;
  horaire: string;
  promotion: string;
  groupe: string;
}

export function FeuilleEmargement({
  students,
  settings,
  date,
  matiere,
  enseignant,
  horaire,
  promotion,
  groupe,
}: EmargementProps) {
  const logo = settings.logo_url || logoEgc;
  const rows = students.length > 0 ? students : [];
  // pad to at least 20 lines for handwriting space
  const minRows = Math.max(rows.length, 20);
  const blanks = minRows - rows.length;

  return (
    <div className="doc-a4">
      <div className="flex items-start justify-between border-b-2 pb-3 mb-5" style={{ borderColor: "#6B21A8" }}>
        <img src={logo} alt="EGC" className="h-16 object-contain" crossOrigin="anonymous" />
        <div className="text-right text-xs text-gray-600">
          <div>{settings.address}</div>
          <div>{settings.postal_code} {settings.city}</div>
          {settings.rne && <div>RNE : {settings.rne}</div>}
        </div>
      </div>

      <h1 className="text-2xl text-center font-bold mb-1" style={{ color: "#6B21A8" }}>
        FEUILLE D'ÉMARGEMENT
      </h1>
      <div className="text-center text-xs mb-4 text-gray-600">
        Année universitaire {new Date().getFullYear()} – {new Date().getFullYear() + 1}
      </div>

      <table className="w-full text-xs mb-4 border border-gray-300">
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold w-28">Promotion</td>
            <td className="border border-gray-300 px-2 py-1">{promotion}</td>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold w-24">Groupe</td>
            <td className="border border-gray-300 px-2 py-1">{groupe || "—"}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">Date</td>
            <td className="border border-gray-300 px-2 py-1">{date}</td>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">Horaire</td>
            <td className="border border-gray-300 px-2 py-1">{horaire}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">Matière</td>
            <td className="border border-gray-300 px-2 py-1">{matiere}</td>
            <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">Enseignant</td>
            <td className="border border-gray-300 px-2 py-1">{enseignant}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ background: "#6B21A8", color: "white" }}>
            <th className="border border-gray-400 px-2 py-1 text-left w-8">#</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Nom</th>
            <th className="border border-gray-400 px-2 py-1 text-left">Prénom</th>
            <th className="border border-gray-400 px-2 py-1 text-left w-24">N° étudiant</th>
            <th className="border border-gray-400 px-2 py-1 text-left" style={{ width: "30%" }}>Signature</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={s.id} style={{ height: "26px" }}>
              <td className="border border-gray-300 px-2 text-gray-500">{i + 1}</td>
              <td className="border border-gray-300 px-2 font-medium">{s.nom.toUpperCase()}</td>
              <td className="border border-gray-300 px-2">{s.prenom}</td>
              <td className="border border-gray-300 px-2 text-gray-600">{s.numEtudiant}</td>
              <td className="border border-gray-300"></td>
            </tr>
          ))}
          {Array.from({ length: blanks }).map((_, i) => (
            <tr key={`b${i}`} style={{ height: "26px" }}>
              <td className="border border-gray-300 px-2 text-gray-400">{rows.length + i + 1}</td>
              <td className="border border-gray-300"></td>
              <td className="border border-gray-300"></td>
              <td className="border border-gray-300"></td>
              <td className="border border-gray-300"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between items-end text-xs">
        <div>
          <div className="text-gray-600 mb-1">Nombre d'étudiants présents : ____ / {rows.length}</div>
          <div className="text-gray-600">Observations :</div>
          <div className="border-b border-gray-400 w-80 mt-3" />
        </div>
        <div className="text-right">
          <div className="text-gray-600 mb-12">Signature de l'enseignant</div>
          <div className="border-t border-gray-400 w-48" />
        </div>
      </div>
    </div>
  );
}
