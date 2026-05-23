import { Megaphone, Info, Calendar, Images, HelpCircle } from "lucide-react";
import RenderSubRoute from "../../components/navigation/RenderSubRoute";

const routes = [
  { label: "Hero", path: "hero", icon: Megaphone },
  { label: "About", path: "about", icon: Info },
  { label: "Events", path: "events", icon: Calendar },
  { label: "Gallery", path: "gallery", icon: Images },
  { label: "FAQs", path: "faqs", icon: HelpCircle },
];

const baseRoute = "content-management";

export default function ContentManagementLayout() {
  return <RenderSubRoute baseRoute={baseRoute} routes={routes} />;
}
