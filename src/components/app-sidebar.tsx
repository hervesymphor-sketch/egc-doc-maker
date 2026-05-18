import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Image as ImageIcon,
  ClipboardList,
  CreditCard,
  FileText,
  Tag,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Étudiants", url: "/etudiants", icon: Users },
  { title: "Trombinoscope", url: "/trombinoscope", icon: ImageIcon },
  { title: "Émargement", url: "/emargement", icon: ClipboardList },
  { title: "Cartes étudiants", url: "/cartes", icon: CreditCard },
  { title: "Étiquettes examen", url: "/etiquettes", icon: Tag },
  { title: "Utilisateurs", url: "/utilisateurs", icon: UserCog },
  { title: "Paramètres", url: "/parametres", icon: Settings },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => currentPath === p || currentPath.startsWith(p + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-gold-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-base text-sidebar-foreground leading-tight">EGC Docs</span>
            <span className="text-xs text-sidebar-foreground/60">Martinique</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              tooltip="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
