import type { FlagshipEventVersion } from "./version";

export interface HeroSection {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  modifiedById: string | null;
  flagshipEventVersionId: string;
  flagshipEventVersion: FlagshipEventVersion;
  heading: string;
  paragraph: string;
}
