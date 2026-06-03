import type { FlagshipEventVersion } from "./version";

/** Social links — mirrors the speaker schema (absolute https URLs). */
export interface TeamSocialLinks {
  instagram?: string;
  linkedin?: string;
  portfolio?: string;
}

/** A team-member category — e.g. "Organizing Committee". */
export interface TeamCategory {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** A designation/role — e.g. "President". */
export interface Designation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  versionId: string;
  categoryId: string;
  designationId: string;
  /** Populated relations when the API includes them on GET. */
  flagshipEventVersion?: FlagshipEventVersion;
  category?: TeamCategory;
  designation?: Designation;
  imageUrl: string | null;
  displayOrder: number;
  socialLinks: TeamSocialLinks | null;
  createdAt: string;
  updatedAt: string;
}
