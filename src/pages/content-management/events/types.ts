import type { FlagshipEventVersion } from "../../../types/version";

export type EventFeeType = "FREE" | "PAID";

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
  flagshipEventVersion?: FlagshipEventVersion;
  speakerId: string;
  totalSeats: number;
  feeType: EventFeeType;
  fee: string;
  location: string;
  status: EventStatus;
  /** ISO date-time */
  registrationDeadline: string;
  displayOrder: number;
  image: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
