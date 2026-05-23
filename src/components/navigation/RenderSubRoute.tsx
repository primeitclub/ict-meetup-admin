import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SubRoute {
  readonly label: string;
  readonly path: string;
  readonly icon?: LucideIcon;
}

interface RenderSubRouteProps {
  readonly routes: ReadonlyArray<SubRoute>;
  readonly baseRoute: string;
}

export default function RenderSubRoute({
  routes,
  baseRoute,
}: RenderSubRouteProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex border-b border-border mb-4 overflow-x-auto overflow-y-hidden">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <NavLink
              key={route.path}
              to={`/${baseRoute}/${route.path}`}
              className={({ isActive }) =>
                `relative inline-flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm  transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{route.label}</span>
                  {Icon ? <Icon className="w-4 h-4" /> : null}
                  {isActive && (
                    <motion.span
                      layoutId="sub-route-underline"
                      className="absolute left-0 right-0 -bottom-px h-[3px] bg-accent"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
