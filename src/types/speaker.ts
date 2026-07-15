import type { FlagshipEventVersion } from "./version";

export interface SpeakerSocialLinks {
  instagram?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Speaker {
  id: string;
  name: string;
  designation: string;
  description?: string | null;
  company: string | null;
  versionId: string;
  /** Populated version relation when the API includes it on GET. */
  flagshipEventVersion?: FlagshipEventVersion;
  imageUrl: string | null;
  displayOrder: number;
  socialLinks: SpeakerSocialLinks | null;
  createdAt: string;
  updatedAt: string;
}
