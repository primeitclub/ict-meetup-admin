import { Share2, Mail, CreditCard } from "lucide-react";
import RenderSubRoute from "../../components/navigation/RenderSubRoute";

const routes = [
  { label: "Social Media Profile", path: "social-media-profile", icon: Share2 },
  { label: "Contact Management", path: "contact-management", icon: Mail },
  { label: "Payment Setup", path: "payment-setup", icon: CreditCard },
];

const baseRoute = "settings";

export default function SettingsLayout() {
  return <RenderSubRoute baseRoute={baseRoute} routes={routes} />;
}
