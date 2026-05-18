import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeuilleEmargement } from "@/components/documents/emargement";
import { exportElementToPdf } from "@/lib/pdf";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/emargement")({
  component: EmargementPage,
});

function EmargementPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const previewRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [promo, setPromo] = useState<"1" | "2" | "3">("1");
  const [groupe, setGroupe] = useState<string>("all");
  const [date, setDate] = useState(today);
  const [matiere, setMatiere] = useState("");
  const [enseignant, setEnseignant] = useState("");
  const [horaire, setHoraire] = useState("08h00 – 10h00");
  const [busy, setBusy] = useState(false);

  const groupes = useMemo(() => {
    const list = students.data?.students ?? [];
    const set = new Set(list.filter((s) => s.promotion === promo).map((s) => s.groupe).filter(Boolean));
    return Array.from(set).sort();
  }, [students.data, promo]);

  const filtered = useMemo(() => {
    let list = (students.data?.students ?? []).filter((s) => s.promotion === promo);
    if (groupe !== "all") list = list.filter((s) => s.groupe === groupe);
    return list.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [students.data, promo, groupe]);

  const formattedDate = useMemo(() => {
    try {
      return new Date(date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date]);

  const handleExport = async () => {
    if (!previewRef.current || !settings.data?.settings) return;
    setBusy(true);
    try {
      const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      const filename = `emargement_promo${promo}${groupe !== "all" ? "_" + safe(groupe) : ""}_${date}.pdf`;
      await exportElementToPdf(previewRef.current, filename);
      toast.success("Feuille d'émargement générée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'export");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-4xl text-primary">Feuilles d'émargement</h1>
        <p className="text-muted-foreground mt-1">Générez la liste de présence pour un cours</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="p-5 space-y-4 h-fit">
          <div className="space-y-2">
            <Label>Promotion</Label>
            <Select value={promo} onValueChange={(v) => { setPromo(v as "1" | "2" | "3"); setGroupe("all"); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Promo 1</SelectItem>
                <SelectItem value="2">Promo 2</SelectItem>
                <SelectItem value="3">Promo 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Groupe</Label>
            <Select value={groupe} onValueChange={setGroupe}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                {groupes.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Horaire</Label>
            <Input value={horaire} onChange={(e) => setHoraire(e.target.value)} placeholder="08h00 – 10h00" />
          </div>

          <div className="space-y-2">
            <Label>Matière</Label>
            <Input value={matiere} onChange={(e) => setMatiere(e.target.value)} placeholder="Ex: Marketing digital" />
          </div>

          <div className="space-y-2">
            <Label>Enseignant</Label>
            <Input value={enseignant} onChange={(e) => setEnseignant(e.target.value)} placeholder="Nom du formateur" />
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            {filtered.length} étudiant{filtered.length > 1 ? "s" : ""} dans la sélection
          </div>

          <Button className="w-full" onClick={handleExport} disabled={busy || filtered.length === 0 || !settings.data?.settings}>
            {busy ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération…</>
            ) : (
              <><FileDown className="w-4 h-4 mr-2" /> Télécharger en PDF</>
            )}
          </Button>
        </Card>

        <Card className="p-4 overflow-auto bg-muted/30">
          {settings.data?.settings ? (
            <div ref={previewRef} className="bg-white shadow-lg mx-auto" style={{ width: "210mm" }}>
              <FeuilleEmargement
                students={filtered}
                settings={settings.data.settings}
                date={formattedDate}
                matiere={matiere || "—"}
                enseignant={enseignant || "—"}
                horaire={horaire || "—"}
                promotion={`Promo ${promo}`}
                groupe={groupe === "all" ? "Tous" : groupe}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">Chargement…</div>
          )}
        </Card>
      </div>
    </div>
  );
}
