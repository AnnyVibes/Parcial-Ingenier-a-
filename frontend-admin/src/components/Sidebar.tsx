import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  ShieldAlert,
  Bell,
  FileCheck,
  Users,
  UserCheck,
  Settings,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "analista", "auditor", "supervisor"] },
  { to: "/expedientes", icon: FileText, label: "Expedientes", roles: ["admin", "analista", "supervisor"] },
  { to: "/workflow", icon: GitBranch, label: "Workflow", roles: ["admin", "analista", "supervisor"] },
  { to: "/alertas", icon: Bell, label: "Alertas", roles: ["admin", "analista", "auditor", "supervisor"] },
  { to: "/clientes", icon: Users, label: "Clientes", roles: ["admin", "analista", "supervisor"] },
  { to: "/pep", icon: UserCheck, label: "PEP", roles: ["admin", "analista", "supervisor"] },
  { to: "/documentos", icon: FileCheck, label: "Documentos", roles: ["admin", "analista", "auditor", "supervisor"] },
  { to: "/auditoria", icon: ShieldAlert, label: "Auditoría", roles: ["admin", "auditor"] },
  { to: "/configuracion", icon: Settings, label: "Configuración", roles: ["admin"] },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { hasRole, user } = useAuth();

  const filteredItems = navItems.filter((item) => hasRole(item.roles));

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold tracking-tight">AML/KYC</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-sm font-medium truncate">{user?.nombre}</p>
        <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.rol}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">
          v1.0.0 &middot; AML/KYC Compliance
        </p>
      </div>
    </aside>
  );
}
