import { Tags, Building2, Archive } from "lucide-react";
import RenderSubRoute from "../../components/navigation/RenderSubRoute";

const routes = [
  { label: "Categories", path: "categories", icon: Tags },
  { label: "All Sponsors", path: "all-sponsors", icon: Building2 },
  { label: "Archive", path: "archive", icon: Archive },
];

const baseRoute = "sponsors";

export default function SponsorsLayout() {
  return <RenderSubRoute baseRoute={baseRoute} routes={routes} />;
}
