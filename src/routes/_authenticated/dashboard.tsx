import { createFileRoute, Link } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const settings = useSchoolSettings();
  const sheetId = settings.data?.settings?.google_sheet_id;
  const students = useStudents(sheetId);

  const counts = useMemo(() => {
    const list = students.data?.students ?? [];
    return {
      total: list.length,
      p1: list.filter((s) => s.promotion === "1").length,
      p2: list.filter((s) => s.promotion === "2").length,
      p3: list.filter((s) => s.promotion === "3").length,
    };
  }, [students.data]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl text-primary">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            {settings.data?.settings?.name ?? "EGC Martinique"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => students.refetch()}
          disabled={students.isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${students.isFetching ? "animate-spin" : ""}`} />
          Synchroniser
        </Button>
      </div>

      {students.data?.errors && students.data.errors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Erreur de connexion au Google Sheet</p>
              {students.data.errors.map((e, i) => (
                <p key={i} className="text-muted-foreground text-xs">{e}</p>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Astuce : le fichier doit être ouvert dans Google Sheets (Fichier → Enregistrer en tant que Google Sheets) et partagé avec le compte connecté.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Étudiants total" value={counts.total} accent />
        <StatCard label="Promotion 1" value={counts.p1} />
        <StatCard label="Promotion 2" value={counts.p2} />
        <StatCard label="Promotion 3" value={counts.p3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          to="/etudiants"
          icon={Users}
          title="Liste des étudiants"
          description="Consulter et filtrer les étudiants par promotion"
        />
        <ActionCard
          to="/trombinoscope"
          icon={ImageIcon}
          title="Trombinoscope"
          description="Générer le trombinoscope d'une promotion"
        />
        <ActionCard
          to="/parametres"
          icon={FileText}
          title="Paramètres"
          description="Informations école, signataire et logo"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className={accent ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-4xl font-serif mt-2 ${accent ? "text-primary" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ActionCard({ to, icon: Icon, title, description }: { to: string; icon: typeof Users; title: string; description: string }) {
  return (
    <Link to={to} className="block">
      <Card className="hover:border-primary/50 hover:shadow-md transition-all h-full">
        <CardHeader>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="font-serif">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
