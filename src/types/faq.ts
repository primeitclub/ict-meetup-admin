import type { FlagshipEventVersion } from "./version";

export interface faqSection {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  modifiedById: string | null;
  versionId: string;
  flagshipEventVersion: FlagshipEventVersion;
  title: string;
  description: string;
}
