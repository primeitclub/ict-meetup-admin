import {
  LayoutDashboard,
  FileText,
  Users,
  Handshake,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  readonly path: string;
  readonly label: string;
}

export interface NavSection {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly children: ReadonlyArray<NavChild>;
}

export const NAV: ReadonlyArray<NavSection> = [
  {
    path: "home",
    label: "Home",
    icon: LayoutDashboard,
    children: [
      { path: "dashboard", label: "Dashboard" },
      { path: "versions", label: "Versions" },
    ],
  },
  {
    path: "content-management",
    label: "Content Management",
    icon: FileText,
    children: [
      { path: "hero", label: "Hero" },
      { path: "about", label: "About" },
      { path: "events", label: "Events" },
      { path: "gallery", label: "Gallery" },
      { path: "faqs", label: "FAQs" },
    ],
  },
  {
    path: "people",
    label: "People",
    icon: Users,
    children: [
      { path: "speakers", label: "Speakers" },
      { path: "teams", label: "Teams" },
    ],
  },
  {
    path: "sponsors",
    label: "Sponsors",
    icon: Handshake,
    children: [
      { path: "categories", label: "Categories" },
      { path: "all-sponsors", label: "All Sponsors" },
      { path: "archive", label: "Archive" },
    ],
  },
  {
    path: "settings",
    label: "Settings",
    icon: Settings,
    children: [
      { path: "social-media-profile", label: "Social Media Profile" },
      { path: "contact-management", label: "Contact Management" },
      { path: "payment-setup", label: "Payment Setup" },
    ],
  },
];
