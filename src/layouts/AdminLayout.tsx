import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Handshake,
  Settings,
  ClipboardList,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { Text } from "../shared/design-components";
import Breadcrumb from "../components/navigation/Breadcrumb";
import ThemeToggle from "../components/theme/ThemeToggle";

import ictIcon from "../assets/icons/logo (1).svg";

interface LinksInterface {
  label: string;
  path: string;
  icon?: LucideIcon;
}

export default function AdminLayout() {
  const { logout, isLoggingOut } = useAuth();
  const links: LinksInterface[] = [
    { label: "Home", path: "/home", icon: LayoutDashboard },
    {
      label: "Content Management",
      path: "/content-management",
      icon: FileText,
    },
    { label: "People", path: "/people", icon: Users },
    { label: "Sponsors", path: "/sponsors", icon: Handshake },
    { label: "Registrations", path: "/registrations", icon: ClipboardList },
  ];

  const configuration: LinksInterface[] = [
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-background text-foreground">
      <aside className="w-72 flex-shrink-0 overflow-y-auto relative bg-surface border-r border-border p-4 flex flex-col">
        {/* top icon title */}
        <div className="flex items-center gap-3">
          <figure className="h-12 w-12 shrink-0 rounded-lg bg-foreground/5 border border-foreground/10 p-2">
            <img
              className="w-full h-full object-contain"
              src={ictIcon}
              alt="ICT Meetup"
            />
          </figure>
          <div className="flex flex-col leading-tight">
            <Text size="lg" weight="bold">
              ICT Meetup
            </Text>
            <Text size="xs" variant="muted">
              Admin · Kathmandu
            </Text>
          </div>
        </div>

        {/* menu */}
        <div className="flex flex-col gap-10 py-12">
          <GroupMenu title="Workspace" links={links} />
          <GroupMenu title="Configuration" links={configuration} />
        </div>

        {/* logout */}
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center space-x-3 p-3 rounded text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors w-full disabled:opacity-50"
          >
            <LogOut size={20} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <Breadcrumb />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={import.meta.env.VITE_FRONTEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-foreground hover:bg-surface-2 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Preview site</span>
            </a>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

interface GroupMenuInterface {
  title: string;
  links: LinksInterface[];
}

function GroupMenu({ title, links }: GroupMenuInterface) {
  return (
    <div className="px-1 flex flex-col gap-2">
      <Text className="tracking-wider font-hubot text-muted-foreground text-md">
        {title}
      </Text>
      <nav className="flex flex-col space-y-2 flex-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 border border-transparent rounded-lg transition-colors ${
                  isActive
                    ? "bg-foreground/5 text-foreground !border-foreground/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                }`
              }
            >
              {Icon ? <Icon size={20} /> : null}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
