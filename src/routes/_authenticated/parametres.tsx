import { createFileRoute } from "@tanstack/react-router";
import { useSchoolSettings } from "@/hooks/use-data";
import { useServerFn } from "@tanstack/react-start";
import { updateSchoolSettings } from "@/lib/settings.functions";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/parametres")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSchoolSettings();
  const update = useServerFn(updateSchoolSettings);
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings.data?.settings) {
      const s = settings.data.settings;
      setForm({
        name: s.name ?? "",
        rne: s.rne ?? "",
        address: s.address ?? "",
        city: s.city ?? "",
        postal_code: s.postal_code ?? "",
        signatory_name: s.signatory_name ?? "",
        signatory_title: s.signatory_title ?? "",
        logo_url: s.logo_url ?? "",
        google_sheet_id: s.google_sheet_id ?? "",
      });
    }
  }, [settings.data]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings.data?.settings) return;
    setSaving(true);
    try {
      await update({ data: { id: settings.data.settings.id, ...form } as any });
      toast.success("Paramètres enregistrés");
      qc.invalidateQueries({ queryKey: ["school_settings"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `logos/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("school-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("school-assets").getPublicUrl(path);
      setForm((f) => ({ ...f, logo_url: data.publicUrl }));
      toast.success("Logo téléchargé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-primary">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Informations affichées sur les documents générés</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Établissement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="name" label="Nom de l'école" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field id="rne" label="Numéro RNE" value={form.rne} onChange={(v) => setForm((f) => ({ ...f, rne: v }))} />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field id="address" label="Adresse" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
              </div>
              <Field id="postal_code" label="Code postal" value={form.postal_code} onChange={(v) => setForm((f) => ({ ...f, postal_code: v }))} />
            </div>
            <Field id="city" label="Ville" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Field id="signatory_name" label="Nom du signataire" value={form.signatory_name} onChange={(v) => setForm((f) => ({ ...f, signatory_name: v }))} />
              <Field id="signatory_title" label="Fonction" value={form.signatory_title} onChange={(v) => setForm((f) => ({ ...f, signatory_title: v }))} />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {form.logo_url && (
                  <img src={form.logo_url} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="google_sheet_id">ID du Google Sheet</Label>
              <Textarea
                id="google_sheet_id"
                value={form.google_sheet_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, google_sheet_id: e.target.value }))}
                rows={2}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                L'ID se trouve dans l'URL : docs.google.com/spreadsheets/d/<span className="font-mono">[ID]</span>/edit
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
