export interface Faq {
  id: string;
  versionId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** A single FAQ row in the editor — `id` is present for existing rows only. */
export interface FaqInput {
  id?: string;
  title: string;
  description: string;
}

/** Body shape for both POST (create) and PUT (sync) /faqs. */
export interface FaqSyncPayload {
  versionId: string;
  faqs: FaqInput[];
}

/** One row of the grouped list (GET /faqs/grouped) — a version + its FAQs. */
export interface GroupedFaqVersion {
  versionId: string;
  versionName: string;
  versionNumber: number;
  status: string;
  faqs: Faq[];
}
