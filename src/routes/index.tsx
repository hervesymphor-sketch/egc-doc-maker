import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, FileText, Image, Shield, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EGC Docs — Gestion des étudiants" },
      { name: "description", content: "Plateforme de gestion des étudiants pour l'École de Gestion et de Commerce — Martinique. Trombinoscope, documents administratifs, suivi des promotions." },
      { property: "og:title", content: "EGC Docs — Gestion des étudiants" },
      { property: "og:description", content: "Plateforme de gestion des étudiants pour l'École de Gestion et de Commerce — Martinique." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg text-primary font-semibold">EGC Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Link to="/login">
              <Button size="sm">Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>École de Gestion et de Commerce — Martinique</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
              Gérez vos étudiants{" "}
              <span className="text-primary">avec élégance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Plateforme complète pour la gestion des promotions, la génération de trombinoscopes
              et la centralisation des documents administratifs.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Accéder à l'application
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </d iv>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">Fonctionnalités</h2>
            <p className="mt-3 text-muted-foreground">Tout ce dont vous avez besoin pour votre école</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Users}
              title="Gestion des étudiants"
              description="Importez et gérez vos étudiants par promotion. Synchronisation avec Google Sheets."
            />
            <FeatureCard
              icon={Image}
              title="Trombinoscope"
              description="Générez automatiquement les trombinoscopes par promotion au format PDF."
            />
            <FeatureCard
              icon={FileText}
              title="Documents administratifs"
              description="Attestations de scolarité, conventions de stage et autres documents officiels."
            />
            <FeatureCard
              icon={Shield}
              title="Sécurisé"
              description="Authentification par email sécurisée. Vos données sont protégées."
            />
            <FeatureCard
              icon={Sparkles}
              title="Interface intuitive"
              description="Design épuré et moderne pour une expérience utilisateur optimale."
            />
            <FeatureCard
              icon={GraduationCap}
              title="Multi-promotions"
              description="Gérez facilement les promotions 1, 2 et 3 en un seul endroit."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/[0.03] border-t">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rejoignez l'École de Gestion et de Commerce et commencez à utiliser EGC Docs dès aujourd'hui.
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm text-muted-foreground">EGC Docs — Martinique</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} École de Gestion et de Commerce. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-all group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-serif text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
