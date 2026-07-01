export type EventFeeType = "free" | "paid";

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface EventItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  subtitle: string;
  description: string;
  /** ISO date-time */
  startTime: string;
  /** ISO date-time */
  endTime: string;
  /** ISO date-time */
  date: string;
  categoryId: string;
  versionId: string;
  /** Populated version relation (when the API includes it on GET). */
  flagshipEvent?: {
    id: string;
    version_name: string;
    version_number: number;
    is_current: boolean;
    status: string;
  };
  speakerId: string;
  totalSeats: number;
  feeType: EventFeeType;
  fee: string;
  location: string;
  status: EventStatus;
  /** ISO date-time */
  registrationDeadline: string;
  displayOrder: number;
  /** Storage path sent on create/update. */
  imagePath: string | null;
  /** Full, displayable URL returned by the API — use this for previews/tables. */
  imageUrl: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
