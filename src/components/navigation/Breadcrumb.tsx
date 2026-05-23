import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { NAV } from "../../config/nav";

function titleCase(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const [, top, sub, action] = pathname.split("/");

  const section = NAV.find((n) => n.path === top);
  if (!section) return null;

  const child = sub ? section.children.find((c) => c.path === sub) : undefined;
  const actionLabel = action ? titleCase(action) : undefined;

  const SectionIcon = section.icon;
  const sectionHref = `/${section.path}`;
  const childHref = child ? `${sectionHref}/${child.path}` : undefined;

  const isSectionLeaf = !child;
  const isChildLeaf = Boolean(child) && !actionLabel;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Link
        to={sectionHref}
        className={`flex items-center text-foreground gap-1.5 transition-colors ${
          isSectionLeaf ? "text-foreground" : "hover:text-foreground"
        }`}
      >
        <SectionIcon size={16} />
        <span>{section.label}</span>
      </Link>

      {child && childHref && (
        <>
          <ChevronRight size={14} className="text-muted-foreground/60" />
          {isChildLeaf ? (
            <span className="text-foreground font-medium">{child.label}</span>
          ) : (
            <Link
              to={childHref}
              className="hover:text-foreground transition-colors"
            >
              {child.label}
            </Link>
          )}
        </>
      )}

      {actionLabel && (
        <>
          <ChevronRight size={14} className="text-muted-foreground/60" />
          <span className="text-foreground font-medium">{actionLabel}</span>
        </>
      )}
    </nav>
  );
}
