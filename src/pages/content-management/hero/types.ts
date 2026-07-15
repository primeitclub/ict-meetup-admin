import type { FlagshipEventVersion } from "../../../types/version";

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
