import { createFileRoute, Link } from "@tanstack/react-router";
import { useSchoolSettings, useStudents } from "@/hooks/use-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Award, Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CertificatScolarite } from "@/components/documents";
import { exportElementsToPdf } from "@/lib/pdf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/etudiants")({
  component: StudentsPage,
});

function StudentsPage() {
  const settings = useSchoolSettings();
  const students = useStudents(settings.data?.settings?.google_sheet_id);
  const [promo, setPromo] = useState<"all" | "1" | "2" | "3">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = students.data?.students ?? [];
    if (promo !== "all") list = list.filter((s) => s.promotion === promo);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.nom.toLowerCase().includes(q) ||
          s.prenom.toLowerCase().includes(q) ||
          s.numEtudiant.toLowerCase().includes(q),
      );
    }
    return list;
  }, [students.data, promo, query]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl text-primary">Étudiants</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} étudiant{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => students.refetch()} disabled={students.isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${students.isFetching ? "animate-spin" : ""}`} />
          Synchroniser
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Tabs value={promo} onValueChange={(v) => setPromo(v as typeof promo)}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="1">Promo 1</TabsTrigger>
            <TabsTrigger value="2">Promo 2</TabsTrigger>
            <TabsTrigger value="3">Promo 3</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Promo</TableHead>
              <TableHead className="hidden md:table-cell">N° étudiant</TableHead>
              <TableHead className="hidden lg:table-cell">Groupe</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Chargement…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucun étudiant</TableCell></TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={s.photo} alt={`${s.prenom} ${s.nom}`} />
                      <AvatarFallback>{s.prenom[0]}{s.nom[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{s.nom}</TableCell>
                  <TableCell>{s.prenom}</TableCell>
                  <TableCell><Badge variant="secondary">Promo {s.promotion}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.numEtudiant}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{s.groupe}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/etudiants/$id" params={{ id: s.id }}>Ouvrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
