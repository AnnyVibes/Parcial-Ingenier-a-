import { Outlet, useLocation, Link } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  expedientes: "Expedientes",
  workflow: "Workflow",
  auditoria: "Auditoría",
  alertas: "Alertas",
  documentos: "Documentos",
  clientes: "Clientes",
  pep: "PEP",
  configuracion: "Configuración",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar expedientes, clientes..." className="pl-9 h-9" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user?.nombre}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 px-4 lg:px-6 py-2 text-sm text-muted-foreground bg-white border-b">
          <Link to="/dashboard" className="hover:text-primary">
            <Home className="h-4 w-4" />
          </Link>
          {segments.map((seg, i) => (
            <span key={seg} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {i === segments.length - 1 ? (
                <span className="text-foreground font-medium">
                  {breadcrumbMap[seg] || seg}
                </span>
              ) : (
                <Link
                  to={"/" + segments.slice(0, i + 1).join("/")}
                  className="hover:text-primary"
                >
                  {breadcrumbMap[seg] || seg}
                </Link>
              )}
            </span>
          ))}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
