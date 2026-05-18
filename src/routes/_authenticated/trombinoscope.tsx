import { createFileRoute } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { exportElementToPdf } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trombinoscope")({
  component: TromboPage,
});

function TromboPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const [promo, setPromo] = useState<"1" | "2" | "3">("1");
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () => (students.data?.students ?? []).filter((s) => s.promotion === promo),
    [students.data, promo],
  );

  const handleExport = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      await exportElementToPdf(ref.current, `trombinoscope_promo_${promo}.pdf`);
      toast.success("Trombinoscope généré");
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
          <h1 className="font-serif text-4xl text-primary">Trombinoscope</h1>
          <p className="text-muted-foreground mt-1">Promotion {promo} — {list.length} étudiants</p>
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
        <div ref={ref} className="doc-a4 mx-auto" style={{ padding: "15mm" }}>
          <div className="text-center mb-6 border-b-2 border-primary pb-4">
            <div className="font-serif text-3xl text-primary">{settings.data?.settings?.name ?? "EGC Martinique"}</div>
            <div className="text-sm text-muted-foreground mt-1">Trombinoscope — Promotion {promo}</div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {list.map((s) => (
              <div key={s.id} className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-2 rounded-lg">
                  <AvatarImage src={s.photo} className="object-cover" />
                  <AvatarFallback className="rounded-lg text-lg">{s.prenom[0]}{s.nom[0]}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-semibold leading-tight">{s.prenom}</div>
                <div className="text-sm leading-tight">{s.nom}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
