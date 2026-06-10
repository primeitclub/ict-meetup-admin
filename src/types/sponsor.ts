/** A sponsor grouping — shared across all versions, type is always "sponsors". */
export interface SponsorCategory {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A sponsor card, tied to a flagship version and a sponsor-type category. */
export interface Sponsor {
  id: string;
  versionId: string;
  categoryId: string;
  name: string;
  link: string | null;
  /** Cloudinary URL — use this to display the logo (NOT imagePath). */
  imageUrl: string;
  /** Internal disk path — ignored on the frontend. */
  imagePath?: string;
  displayOrder: number;
  /** Nested relations included on GET responses. */
  category?: { id: string; name: string; type: string; displayOrder: number };
  flagshipEvent?: { id: string; version_name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
