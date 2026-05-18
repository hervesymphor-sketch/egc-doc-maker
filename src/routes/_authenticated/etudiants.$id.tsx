import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, IdCard, FileSignature, Award } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  CertificatScolarite,
  AttestationPresence,
  CarteEtudiant,
  ConventionStage,
} from "@/components/documents";
import { exportElementToPdf } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/etudiants/$id")({
  component: StudentDetail,
});

type DocType = "certificat" | "attestation" | "carte" | "convention";

function StudentDetail() {
  const { id } = useParams({ from: "/_authenticated/etudiants/$id" });
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const student = useMemo(
    () => students.data?.students.find((s) => s.id === id),
    [students.data, id],
  );

  const [docType, setDocType] = useState<DocType | null>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  if (students.isLoading) return <p className="text-muted-foreground">Chargement…</p>;
  if (!student) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Étudiant introuvable.</p>
        <Button asChild variant="link"><Link to="/etudiants">Retour</Link></Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!docRef.current || !docType) return;
    setGenerating(true);
    try {
      const name = `${docType}_${student.nom}_${student.prenom}.pdf`;
      await exportElementToPdf(docRef.current, name);
      toast.success("Document généré");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de génération");
    } finally {
      setGenerating(false);
    }
  };

  const docs = [
    { type: "certificat" as const, label: "Certificat de scolarité", icon: Award },
    { type: "attestation" as const, label: "Attestation de présence", icon: FileText },
    { type: "carte" as const, label: "Carte étudiant", icon: IdCard },
    { type: "convention" as const, label: "Convention de stage", icon: FileSignature },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/etudiants"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={student.photo} />
              <AvatarFallback className="text-xl">{student.prenom[0]}{student.nom[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-serif text-3xl">{student.prenom} {student.nom}</CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">Promotion {student.promotion}</Badge>
                {student.email && <Badge variant="outline">{student.email}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Info label="Date de naissance" value={student.dateNaissance} />
          <Info label="Lieu de naissance" value={student.lieuNaissance} />
          <Info label="Sexe" value={student.sexe} />
          <Info label="Adresse" value={student.adresse} />
          <Info label="Ville" value={`${student.codePostal} ${student.ville}`} />
          <Info label="Téléphone" value={student.telephone} />
        </CardContent>
      </Card>

      <div>
        <h2 className="font-serif text-2xl text-primary mb-3">Générer un document</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {docs.map((d) => (
            <button
              key={d.type}
              onClick={() => setDocType(d.type)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                docType === d.type ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <d.icon className="w-5 h-5 text-primary mb-2" />
              <div className="text-sm font-medium">{d.label}</div>
            </button>
          ))}
        </div>
      </div>

      {docType && settings.data?.settings && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Aperçu</CardTitle>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Génération…" : "Télécharger le PDF"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto bg-muted p-4 rounded-md flex justify-center">
              <div ref={docRef}>
                {docType === "certificat" && (
                  <CertificatScolarite student={student} settings={settings.data.settings} />
                )}
                {docType === "attestation" && (
                  <AttestationPresence student={student} settings={settings.data.settings} />
                )}
                {docType === "carte" && (
                  <CarteEtudiant student={student} settings={settings.data.settings} />
                )}
                {docType === "convention" && (
                  <ConventionStage student={student} settings={settings.data.settings} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-1">{value || "—"}</div>
    </div>
  );
}
