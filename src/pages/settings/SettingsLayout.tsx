import { Share2, Mail, CreditCard, Building, FileText } from "lucide-react";
import RenderSubRoute from "../../components/navigation/RenderSubRoute";

const routes = [
  { label: "Club Details", path: "club-details", icon: Building },
  { label: "Social Media Profile", path: "social-media-profile", icon: Share2 },
  { label: "Contact Management", path: "contact-management", icon: Mail },
  { label: "Payment Setup", path: "payment-setup", icon: CreditCard },
  { label: "Proposal Setup", path: "proposal-setup", icon: FileText },
];

const baseRoute = "settings";

export default function SettingsLayout() {
  return <RenderSubRoute baseRoute={baseRoute} routes={routes} />;
}
