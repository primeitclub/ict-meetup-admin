import { useApiMutation } from "../use-api-mutation";
import type { AboutSection } from "../../types/about";

export interface CreateAboutSectionPayload {
  flagshipEventVersionId: string;
  title: string;
  content: string;
  image: string;
}

export default function useCreateAboutection() {
  return useApiMutation("about")<
    { data: AboutSection },
    CreateAboutSectionPayload
  >({ method: "POST", invalidateRoutes: ["about"] });
}
