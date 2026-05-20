import { useApiMutation } from "../use-api-mutation";
import type { faqSection } from "../../types/faq";

export interface CreateFaqSectionPayload {
  versionId: string;
  title: string;
  description: string;
}

export default function useCreateFaqSection() {
  return useApiMutation("faqs")<{ data: faqSection }, CreateFaqSectionPayload>({
    method: "POST",
    invalidateRoutes: ["faqs"],
  });
}
