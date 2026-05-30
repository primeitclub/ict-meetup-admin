import { useApiMutation } from "../../../lib/use-api-mutation";
import type { HeroSection } from "./types";

export interface CreateHeroSectionPayload {
  flagshipEventVersionId: string;
  heading: string;
  paragraph: string;
}

export default function useCreateHeroSection() {
  return useApiMutation("heroSections")<
    { data: HeroSection },
    CreateHeroSectionPayload
  >({ method: "POST", invalidateRoutes: ["heroSections"] });
}
