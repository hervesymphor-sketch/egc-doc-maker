import type { Student, SchoolSettings } from "@/lib/types";
import logoEgc from "@/assets/logo-egc.png";

interface Props {
  student: Student;
  settings: SchoolSettings;
}

function DocHeader({ settings, showAddress = true }: { settings: SchoolSettings; showAddress?: boolean }) {
  const logo = settings.logo_url || logoEgc;
  return (
    <div className="flex items-start justify-between border-b-2 pb-4 mb-8" style={{ borderColor: "#6B21A8" }}>
      <div className="flex items-center gap-4">
        <img src={logo} alt="EGC Business School" className="h-20 object-contain" crossOrigin="anonymous" />
        {showAddress && (
          <div>
            <div className="text-xs text-gray-600">{settings.address} {settings.postal_code} {settings.city}</div>
            {settings.rne && <div className="text-xs text-gray-600">RNE : {settings.rne}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function DocFooter({ settings }: { settings: SchoolSettings }) {
  const city = settings.city || "Fort-de-France";
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="mt-16 flex justify-end">
      <div className="text-right">
        <div className="text-sm">Fait à {city}, le {today}</div>
        <div className="mt-2 text-sm italic">{settings.signatory_title}</div>
        <div className="mt-12 text-sm font-semibold">{settings.signatory_name || "—"}</div>
      </div>
    </div>
  );
}

export function CertificatScolarite({ student, settings }: Props) {
  return (
    <div className="doc-a4">
      <DocHeader settings={settings} showAddress={false} />
      <h1 className="text-3xl text-center font-bold mb-2" style={{ color: "#6B21A8" }}>
        CERTIFICAT DE SCOLARITÉ
      </h1>
      <div className="text-center text-sm mb-10 text-gray-600">Année universitaire {new Date().getFullYear()} – {new Date().getFullYear() + 1}</div>
      <p className="text-lg leading-relaxed mb-4">
        Je soussigné(e), <strong>{settings.signatory_name || "[Signataire]"}</strong>, {settings.signatory_title}, certifie que :
      </p>
      <p className="text-xl text-center my-6 font-semibold">
        {student.prenom} {student.nom}
      </p>
      <p className="text-base leading-relaxed">
        né(e) le {student.dateNaissance} à {student.lieuNaissance}, est régulièrement inscrit(e) en
        <strong> Promotion {student.promotion}</strong> à l'{settings.name} pour l'année universitaire en cours.
      </p>
      <p className="text-base leading-relaxed mt-6">
        Le présent certificat lui est délivré pour servir et valoir ce que de droit.
      </p>
      <DocFooter settings={settings} />
      <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600" style={{ borderColor: "#6B21A8" }}>
        <div>{settings.address} {settings.postal_code} {settings.city}</div>
        <div>Tél.: 0596649841</div>
      </div>
    </div>
  );
}

export function AttestationPresence({ student, settings }: Props) {
  return (
    <div className="doc-a4">
      <DocHeader settings={settings} />
      <h1 className="text-3xl text-center font-bold mb-2" style={{ color: "#6B21A8" }}>
        ATTESTATION DE PRÉSENCE
      </h1>
      <div className="text-center text-sm mb-10 text-gray-600">Année universitaire {new Date().getFullYear()} – {new Date().getFullYear() + 1}</div>
      <p className="text-lg leading-relaxed mb-4">
        Je soussigné(e), <strong>{settings.signatory_name || "[Signataire]"}</strong>, {settings.signatory_title} de {settings.name}, atteste que :
      </p>
      <p className="text-xl text-center my-6 font-semibold">
        {student.prenom} {student.nom}
      </p>
      <p className="text-base leading-relaxed">
        né(e) le {student.dateNaissance} à {student.lieuNaissance}, étudiant(e) en Promotion {student.promotion},
        a suivi avec assiduité les enseignements dispensés au sein de notre établissement.
      </p>
      <p className="text-base leading-relaxed mt-6">
        Cette attestation est délivrée à l'intéressé(e) à sa demande pour faire valoir ce que de droit.
      </p>
      <DocFooter settings={settings} />
    </div>
  );
}

export function CarteEtudiant({ student, settings }: Props) {
  return (
    <div className="doc-a4 flex flex-col items-center justify-start gap-6 pt-12">
      <DocHeader settings={settings} />
      <h2 className="text-2xl font-bold" style={{ color: "#6B21A8" }}>Carte étudiant</h2>

      {/* Recto */}
      <div className="rounded-xl overflow-hidden shadow-xl" style={{ width: "85.6mm", height: "53.98mm", background: "linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)", color: "white", padding: "2.5mm", display: "flex", gap: "2.5mm" }}>
        {student.photo ? (
          <img src={student.photo} alt="" className="rounded-md object-cover" style={{ width: "26mm", height: "42mm" }} crossOrigin="anonymous" />
        ) : (
          <div className="rounded-md bg-white/20 flex items-center justify-center text-3xl font-bold" style={{ width: "26mm", height: "42mm" }}>
            {student.prenom[0]}{student.nom[0]}
          </div>
        )}
        <div className="flex-1 flex flex-col justify-between" style={{ height: "42mm" }}>
          <div className="flex items-center justify-between">
            <img src={settings.logo_url || logoEgc} alt="" className="h-4 object-contain brightness-0 invert" crossOrigin="anonymous" />
            <div className="text-[6px] opacity-70">Carte étudiant</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold leading-tight">{student.prenom}</div>
            <div className="text-[11px] font-bold leading-tight">{student.nom.toUpperCase()}</div>
            <div className="text-[7px] mt-0.5 opacity-80">Promotion {student.promotion}</div>
            <div className="text-[6px] opacity-70">Né(e) le {student.dateNaissance}</div>
            {student.ine && <div className="text-[6px] opacity-70">INE : {student.ine}</div>}
            {student.numEtudiant && <div className="text-[6px] opacity-70">N° étudiant : {student.numEtudiant}</div>}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-end justify-between">
              <div className="text-[5px] opacity-50">Année {new Date().getFullYear()}-{new Date().getFullYear() + 1}</div>
              <div className="text-[5px] opacity-50 border-t border-white/30 text-center" style={{ width: "16mm" }}>Signature</div>
            </div>
            <div className="text-[5px] text-center leading-tight">
              <div className="font-bold">Ecole de Gestion et de Commerce</div>
              <div>Skillfor Campus - Rue A.Edmond 97233 SCHOELCHER</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center max-w-md">
        Cette carte est strictement personnelle. À présenter à toute réquisition.
      </p>
    </div>
  );
}

export function ConventionStage({ student, settings }: Props) {
  return (
    <div className="doc-a4">
      <DocHeader settings={settings} />
      <h1 className="text-2xl text-center font-bold mb-6" style={{ color: "#6B21A8" }}>
        CONVENTION DE STAGE
      </h1>
      <p className="text-sm mb-6 text-center text-gray-600">Année universitaire {new Date().getFullYear()} – {new Date().getFullYear() + 1}</p>

      <section className="mb-4">
        <h2 className="font-bold text-base mb-2" style={{ color: "#6B21A8" }}>Entre les soussignés :</h2>
        <p className="text-sm">
          <strong>L'établissement :</strong> {settings.name}, {settings.address} {settings.postal_code} {settings.city},
          représenté par {settings.signatory_name || "[Signataire]"}, {settings.signatory_title}.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-bold text-base mb-2" style={{ color: "#6B21A8" }}>Le stagiaire :</h2>
        <p className="text-sm">
          {student.prenom} {student.nom}, né(e) le {student.dateNaissance} à {student.lieuNaissance},
          demeurant {student.adresse}.
          Étudiant(e) en Promotion {student.promotion}{student.groupe ? ` — Groupe ${student.groupe}` : ""}
          {student.numEtudiant ? `, N° étudiant ${student.numEtudiant}` : ""}.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-bold text-base mb-2" style={{ color: "#6B21A8" }}>L'organisme d'accueil :</h2>
        <div className="text-sm border border-gray-300 rounded p-3 min-h-16 italic text-gray-400">
          [Nom de l'entreprise, adresse, représentant — à compléter]
        </div>
      </section>

      <section className="mb-4">
        <h2 className="font-bold text-base mb-2" style={{ color: "#6B21A8" }}>Objet et durée :</h2>
        <p className="text-sm">
          Le présent stage a pour objet de permettre à l'étudiant(e) de mettre en pratique les enseignements reçus.
          Durée : du __ / __ / ____ au __ / __ / ____.
        </p>
      </section>

      <DocFooter settings={settings} />
    </div>
  );
}
