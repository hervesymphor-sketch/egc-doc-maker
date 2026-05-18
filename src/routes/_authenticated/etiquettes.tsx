import { createFileRoute } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { exportElementsToPdf } from "@/lib/pdf";
import { toast } from "sonner";
import type { Student } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/etiquettes")({
  component: EtiquettesPage,
});

const LABELS_PER_PAGE = 10; // 2 cols x 5 rows

function ExamLabel({ student }: { student: Student }) {
  return (
    <div
      className="border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center"
      style={{
        width: "95mm",
        height: "50mm",
        padding: "4mm",
      }}
    >
      <div style={{ fontSize: "16pt" }} className="text-gray-800">
        {student.prenom}
      </div>
      <div style={{ fontSize: "22pt", fontWeight: 800, lineHeight: 1.1, marginTop: "2mm" }} className="text-black">
        {student.nom.toUpperCase()}
      </div>
      {student.numEtudiant && (
        <div style={{ fontSize: "11pt", marginTop: "3mm" }} className="text-gray-600">
          N° étudiant : {student.numEtudiant}
        </div>
      )}
    </div>
  );
}

function EtiquettesPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const [promo, setPromo] = useState<"1" | "2" | "3">("1");
  const [busy, setBusy] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () =>
      (students.data?.students ?? [])
        .filter((s) => s.promotion === promo)
        .sort((a, b) => a.nom.localeCompare(b.nom)),
    [students.data, promo],
  );

  const pages = useMemo(() => {
    const chunks: Student[][] = [];
    for (let i = 0; i < list.length; i += LABELS_PER_PAGE) {
      chunks.push(list.slice(i, i + LABELS_PER_PAGE));
    }
    return chunks;
  }, [list]);

  const handleExport = async () => {
    if (!pagesRef.current) return;
    const pageEls = Array.from(
      pagesRef.current.querySelectorAll<HTMLDivElement>("[data-label-page]"),
    );
    if (pageEls.length === 0) return;
    setBusy(true);
    try {
      await exportElementsToPdf(pageEls, `etiquettes_examen_promo_${promo}.pdf`);
      toast.success("Étiquettes générées");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl text-primary">Étiquettes d'examen</h1>
          <p className="text-muted-foreground mt-1">
            Promotion {promo} — {list.length} étudiants ({pages.length} page{pages.length > 1 ? "s" : ""})
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
          <Button onClick={handleExport} disabled={busy || list.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {busy ? "Export…" : "Exporter PDF"}
          </Button>
        </div>
      </div>

      <Card className="p-6 overflow-auto">
        <div ref={pagesRef} className="space-y-6">
          {pages.map((chunk, i) => (
            <div
              key={i}
              data-label-page
              className="doc-a4 mx-auto bg-white"
              style={{ padding: "8mm" }}
            >
              <div className="grid grid-cols-2 gap-2 justify-items-center">
                {chunk.map((student) => (
                  <ExamLabel key={student.id} student={student} />
                ))}
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Aucun étudiant pour cette promotion.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
