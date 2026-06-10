import type { FlagshipEventVersion } from "./version";

export interface GalleryImage {
  /** Stable id for this image — React key and reference for edit/delete. */
  id: string;
  /** Local-served path — ignore for rendering. */
  imagePath?: string;
  /** Cloudinary URL — render this. */
  cloudImageUrl: string;
  /** Optional click-through URL for this image. */
  link: string | null;
}

/** A version's gallery — exactly one per version, holding 1–7 images. */
export interface GalleryItem {
  id: string;
  flagshipEventVersionId: string;
  images: GalleryImage[];
  flagshipEventVersion?: FlagshipEventVersion;
  createdAt: string;
  updatedAt: string;
}

export const GALLERY_MIN_IMAGES = 1;
export const GALLERY_MAX_IMAGES = 7;

/** Safely read a gallery's images (tolerates a missing/empty array). */
export function normalizeGalleryImages(
  item: GalleryItem | undefined,
): GalleryImage[] {
  return item?.images ?? [];
}
