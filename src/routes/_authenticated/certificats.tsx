import { createFileRoute } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { exportElementsToPdf } from "@/lib/pdf";
import { toast } from "sonner";
import { CertificatScolarite } from "@/components/documents";

export const Route = createFileRoute("/_authenticated/certificats")({
  component: CertificatsPage,
});

function CertificatsPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const [promo, setPromo] = useState<"1" | "2" | "3">("1");
  const [busy, setBusy] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () => (students.data?.students ?? []).filter((s) => s.promotion === promo),
    [students.data, promo],
  );

  const handleExport = async () => {
    if (!pagesRef.current || !settings.data?.settings) return;
    const pageEls = Array.from(
      pagesRef.current.querySelectorAll<HTMLDivElement>("[data-cert-page]"),
    );
    if (pageEls.length === 0) return;
    setBusy(true);
    try {
      await exportElementsToPdf(pageEls, `certificats_scolarite_promo_${promo}.pdf`);
      toast.success("Certificats générés");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const s = settings.data?.settings;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl text-primary">Certificats de scolarité</h1>
          <p className="text-muted-foreground mt-1">
            Promotion {promo} — {list.length} étudiant{list.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Tabs value={promo} onValueChange={(v) => setPromo(v as typeof promo)}>
            <TabsList>
              <TabsTrigger value="1">Promo 1</TabsTrigger>
              <TabsTrigger value="2">Promo 2</TabsTrigger>
              <TabsTrigger value="3">Promo 3</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleExport} disabled={busy || list.length === 0 || !s}>
            <Download className="w-4 h-4 mr-2" />
            {busy ? "Export…" : "Exporter PDF"}
          </Button>
        </div>
      </div>

      <Card className="p-6 overflow-auto">
        <div ref={pagesRef} className="space-y-6">
          {s &&
            list.map((student) => (
              <div key={student.id} data-cert-page className="mx-auto bg-white">
                <CertificatScolarite student={student} settings={s} />
              </div>
            ))}
          {list.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Aucun étudiant pour cette promotion.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
