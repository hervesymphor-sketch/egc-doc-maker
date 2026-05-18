import { createFileRoute } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { exportElementsToPdf } from "@/lib/pdf";
import { toast } from "sonner";
import logoEgc from "@/assets/logo-egc.png";
import type { Student, SchoolSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/cartes")({
  component: CartesPage,
});

const CARDS_PER_PAGE = 10; // 2 cols x 5 rows

function StudentCard({ student, settings }: { student: Student; settings: SchoolSettings }) {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-md"
      style={{
        width: "85.6mm",
        height: "53.98mm",
        background: "linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)",
        color: "white",
        padding: "4mm",
        display: "flex",
        gap: "4mm",
      }}
    >
      {student.photo ? (
        <img
          src={student.photo}
          alt=""
          className="rounded-md object-cover"
          style={{ width: "30mm", height: "45mm" }}
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className="rounded-md bg-white/20 flex items-center justify-center text-3xl font-bold"
          style={{ width: "30mm", height: "45mm" }}
        >
          {student.prenom[0]}
          {student.nom[0]}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <img
            src={settings.logo_url || logoEgc}
            alt=""
            className="h-5 object-contain brightness-0 invert"
            crossOrigin="anonymous"
          />
          <div className="text-[7px] opacity-70">Carte étudiant</div>
        </div>
        <div>
          <div className="text-xs font-semibold leading-tight">{student.prenom}</div>
          <div className="text-sm font-bold leading-tight">{student.nom.toUpperCase()}</div>
          <div className="text-[8px] mt-1 opacity-80">Promotion {student.promotion}</div>
          <div className="text-[7px] opacity-70">Né(e) le {student.dateNaissance}</div>
        </div>
        <div className="text-[6px] opacity-50">
          Année {new Date().getFullYear()}-{new Date().getFullYear() + 1}
        </div>
      </div>
    </div>
  );
}

function CartesPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const [promo, setPromo] = useState<"1" | "2" | "3">("1");
  const [busy, setBusy] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () => (students.data?.students ?? []).filter((s) => s.promotion === promo),
    [students.data, promo],
  );

  const pages = useMemo(() => {
    const chunks: Student[][] = [];
    for (let i = 0; i < list.length; i += CARDS_PER_PAGE) {
      chunks.push(list.slice(i, i + CARDS_PER_PAGE));
    }
    return chunks;
  }, [list]);

  const handleExport = async () => {
    if (!pagesRef.current || !settings.data?.settings) return;
    const pageEls = Array.from(
      pagesRef.current.querySelectorAll<HTMLDivElement>("[data-card-page]"),
    );
    if (pageEls.length === 0) return;
    setBusy(true);
    try {
      await exportElementsToPdf(pageEls, `cartes_etudiants_promo_${promo}.pdf`);
      toast.success("Cartes générées");
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
          <h1 className="font-serif text-4xl text-primary">Cartes étudiants</h1>
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
          <Button onClick={handleExport} disabled={busy || list.length === 0 || !s}>
            <Download className="w-4 h-4 mr-2" />
            {busy ? "Export…" : "Exporter PDF"}
          </Button>
        </div>
      </div>

      <Card className="p-6 overflow-auto">
        <div ref={pagesRef} className="space-y-6">
          {s &&
            pages.map((chunk, i) => (
              <div
                key={i}
                data-card-page
                className="doc-a4 mx-auto bg-white"
                style={{ padding: "10mm" }}
              >
                <div className="grid grid-cols-2 gap-4 justify-items-center">
                  {chunk.map((student) => (
                    <StudentCard key={student.id} student={student} settings={s} />
                  ))}
                </div>
              </div>
            ))}
          {pages.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aucun étudiant pour cette promotion.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
