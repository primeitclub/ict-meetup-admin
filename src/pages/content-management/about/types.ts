import type { FlagshipEventVersion } from "../../../types/version";

export interface AboutSection {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  modifiedById: string | null;
  /** Foreign key to the flagship version. */
  versionId: string;
  /** Populated version relation (when the API includes it on GET). */
  flagshipEventVersion: FlagshipEventVersion;
  content: string;
  /** Image URL once stored. The upload itself is multipart binary. */
  imageUrl: string | null;
}
