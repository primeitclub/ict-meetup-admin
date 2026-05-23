import { Mic, Users2 } from "lucide-react";
import RenderSubRoute from "../../components/navigation/RenderSubRoute";

const routes = [
  { label: "Speakers", path: "speakers", icon: Mic },
  { label: "Teams", path: "teams", icon: Users2 },
];

const baseRoute = "people";

export default function PeopleLayout() {
  return <RenderSubRoute baseRoute={baseRoute} routes={routes} />;
}
