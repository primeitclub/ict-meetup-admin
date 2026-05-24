import { useApiMutation } from "../use-api-mutation";
import type { HeroSection } from "../../types/hero";

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
