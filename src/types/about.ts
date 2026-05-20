import type { FlagshipEventVersion } from "./version";

export interface AboutSection {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  modifiedById: string | null;
  versionId: string;
  flagshipEventVersion: FlagshipEventVersion;
  title: string;
  content: string;
  image: string;
  extraOptions: {
    add_cta: { cta_title: string; cta_url: string }[];
  };
}
