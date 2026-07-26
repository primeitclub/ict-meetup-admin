import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../../components/form-field/input-field/InputController";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import FormComboBox from "../../../components/form-field/combobox/FormComboBox";
import FormMultiComboBox from "../../../components/form-field/combobox/FormMultiComboBox";
import FormMarkdown from "../../../components/form-field/markdown/MarkdownController";
import FormDatePicker from "../../../components/form-field/date-picker/FormDatePicker";
import FormTimeRange from "../../../components/form-field/time-picker/FormTimeRange";
import { parseDate } from "../../../shared/utils/date";
import FormFileUpload from "../../../components/form-field/FormFileUpload";
import useGetVersionOptions from "../../../lib/hooks/use-get-version-options";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import {
  type EventItem,
  type EventCategory,
  type EventFeeType,
  EventStatus,
  EventType,
} from "./types";
import type { Speaker } from "../../../types/speaker";

import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

interface EventFormValues {
  title: string;
  subtitle: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  categoryId: string;
  versionId: string;
  speakerIds: string[];
  totalSeats: string;
  feeType: EventFeeType | "";
  fee: string;
  location: string;
  status: EventStatus | "";
  registrationDeadline: string;
  displayOrder: string;
  isHighlighted: boolean;
  eventType: EventType | "";
  maxParticipants: string;
  registerLink: string;
}

const feeTypeOptions = [
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

const statusOptions = [
  { label: "Archived", value: EventStatus.ARCHIVED },
  { label: "Draft", value: EventStatus.DRAFT },
  { label: "Published", value: EventStatus.PUBLISHED },
];

const eventTypeOptions = [
  { label: "Single", value: EventType.SINGLE },
  { label: "Group", value: EventType.GROUP },
];

export default function EventsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  const { options: versionOptions, isLoading: versionsLoading, activeVersionId } =
    useGetVersionOptions();

  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery(
    "eventCategories",
  )<{ data: { items: EventCategory[] } }>();

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data?.items ?? []).map((category) => ({
        label: category.displayName || category.name,
        value: category.id,
      })),
    [categoriesData],
  );

  const { data: existingData, isLoading: isFetching } = useApiQuery(
    "eventDetail",
  )<{ data: EventItem }>({
    pathParams: { eventId: id as string },
    config: { enabled: isEdit },
  });

  const methods = useForm<EventFormValues>({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      startTime: "",
      endTime: "",
      date: "",
      categoryId: "",
      versionId: "",
      speakerIds: [],
      totalSeats: "",
      feeType: "",
      fee: "",
      location: "",
      status: "",
      registrationDeadline: "",
      displayOrder: "",
      isHighlighted: false,
      eventType: "",
      maxParticipants: "",
      registerLink: "",
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const isPaid = watch("feeType") === "paid";

  // The fee input is hidden once the event isn't paid, so any previously-typed
  // value would otherwise linger in form state and fail the API's "Free events
  // cannot have a fee" validation on submit — clear it here instead of forcing
  // the user to flip back to Paid just to blank the (now invisible) field.
  useEffect(() => {
    if (!isPaid) {
      setValue("fee", "", { shouldDirty: false });
    }
  }, [isPaid, setValue]);
  const selectedVersionId = watch("versionId");
  const isHighlighted = watch("isHighlighted");
  const selectedEventType = watch("eventType");
  const isGroup = selectedEventType === EventType.GROUP;
  const eventDate = watch("date");
  const registrationDeadline = watch("registrationDeadline");

  // Keep the two pickers mutually exclusive at the UI level — disabling the
  // invalid days is more reliable than showing a validation error after the
  // fact, and matches the API's "deadline must be before the event date" rule.
  const minEventDate = useMemo(() => {
    const deadline = parseDate(registrationDeadline);
    if (!deadline) return undefined;
    const next = new Date(deadline);
    next.setDate(next.getDate() + 1);
    return next;
  }, [registrationDeadline]);

  const maxRegistrationDeadline = useMemo(() => {
    const date = parseDate(eventDate);
    if (!date) return undefined;
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    return prev;
  }, [eventDate]);

  const { data: speakersData, isLoading: speakersLoading } = useApiQuery(
    "speakers",
  )<{ data: { items: Speaker[] } }>({
    queryParams: { versionId: selectedVersionId },
    config: { enabled: !!selectedVersionId },
  });

  const speakerOptions = useMemo(
    () =>
      (speakersData?.data?.items ?? []).map((speaker) => ({
        label: speaker.name,
        value: speaker.id,
      })),
    [speakersData],
  );

  const toggleHighlighted = useCallback(
    () => setValue("isHighlighted", !isHighlighted, { shouldDirty: true }),
    [isHighlighted, setValue],
  );

  const prevVersionIdRef = useRef<string>("");
  useEffect(() => {
    const prev = prevVersionIdRef.current;
    prevVersionIdRef.current = selectedVersionId;
    // Only clear speakers when the user actively switches from one valid version to
    // another — speakers are version-scoped, so the old picks are invalid for the new
    // version. Skip when going from "" → something (initial load / reset populating the form).
    if (prev && selectedVersionId && prev !== selectedVersionId) {
      setValue("speakerIds", [], { shouldDirty: false });
    }
  }, [selectedVersionId, setValue]);

  const imagePreview = imageCleared
    ? null
    : (uploadedPreview ?? existingData?.data?.imageUrl ?? null);

  useEffect(() => {
    if (existingData?.data) {
      const ev = existingData.data;
      reset({
        title: ev.title ?? "",
        subtitle: ev.subtitle ?? "",
        description: ev.description ?? "",
        startTime: ev.startTime ? ev.startTime.slice(0, 5) : "",
        endTime: ev.endTime ? ev.endTime.slice(0, 5) : "",
        date: ev.date ? ev.date.split("T")[0] : "",
        categoryId: ev.categoryId ?? "",
        versionId: ev.versionId ?? "",
        speakerIds: (ev.speakers ?? []).map((speaker) => speaker.id),
        totalSeats: ev.totalSeats?.toString() ?? "",
        feeType: ev.feeType ?? "",
        fee: ev.fee ?? "",
        location: ev.location ?? "",
        status: ev.status ?? "",
        registrationDeadline: ev.registrationDeadline
          ? ev.registrationDeadline.split("T")[0]
          : "",
        displayOrder: ev.displayOrder?.toString() ?? "",
        isHighlighted: ev.isHighlighted ?? false,
        eventType: ev.eventType ?? "",
        maxParticipants: ev.maxParticipants?.toString() ?? "",
        registerLink: ev.registerLink ?? "",
      });
    }
  }, [existingData, reset]);

  // Auto-select the active version on create — without resetting other fields
  // the user may have already filled in.
  useEffect(() => {
    if (!isEdit && activeVersionId) {
      setValue("versionId", activeVersionId);
    }
  }, [isEdit, activeVersionId, setValue]);

  const { execute: createEvent, isLoading: isCreating } = useApiMutation(
    "events",
  )<EventItem, FormData>({
    method: "POST",
    invalidateRoutes: ["events"],
    onSuccess: () => {
      toast.success("Event created successfully");
      navigate("/content-management/events");
    },
    onError: (err) => toast.error(err.message || "Failed to create event"),
  });

  const { execute: updateEvent, isLoading: isUpdating } = useApiMutation(
    "eventDetail",
  )<EventItem, FormData>({
    method: "PATCH",
    pathParams: { eventId: id as string },
    invalidateRoutes: ["events", "eventDetail"],
    onSuccess: () => {
      toast.success("Event updated successfully");
      navigate("/content-management/events");
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to update event"),
  });

  const onSubmit = async (data: EventFormValues) => {
    // Image is required when creating; on edit an existing image may already be set.
    if (!isEdit && !imageFile) {
      toast.error("Image is required");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Append one field per element — String(array) would comma-join into a single
        // value. An empty array still sends "" so the API can tell "none selected"
        // apart from "field omitted, leave unchanged".
        if (value.length === 0) {
          formData.append(key, "");
        } else {
          value.forEach((item) => formData.append(key, String(item)));
        }
        return;
      }
      if (value !== "" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    // Always send registerLink, blank included. The loop above skips empty
    // strings, which would make clearing an existing link a silent no-op.
    // set() replaces the loop's value rather than appending a duplicate.
    formData.set("registerLink", (data.registerLink ?? "").trim());
    // Same deal for totalSeats — blank means "clear to unlimited", which requires
    // actually sending "" rather than omitting the field.
    formData.set("totalSeats", data.totalSeats ?? "");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit) {
      await updateEvent(formData);
    } else {
      await createEvent(formData);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file === null) {
      setUploadedPreview(null);
      setImageFile(null);
      setImageCleared(true);
      return;
    }
    setImageFile(file);
    setImageCleared(false);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isLoading = isCreating || isUpdating || isFetching;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">
            {isEdit ? "Edit Event" : "Create New Event"}
          </h1>
          <Text size="sm" variant="muted">
            Add or update an event for a flagship version.
          </Text>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Basics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Keynote: The Future of ICT"
                rules={{ required: "Title is required" }}
              />
              <FormInput
                name="subtitle"
                label="Subtitle"
                placeholder="A short tagline"
                rules={{ required: "Subtitle is required" }}
                isRequired
              />
            </div>

            <Divider />

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormDatePicker
                control={control}
                name="date"
                label="Event Date"
                rules={{ required: "Event date is required" }}
                error={errors.date?.message}
                isRequired
                minDate={minEventDate}
              />
              <FormDatePicker
                control={control}
                name="registrationDeadline"
                label="Registration Deadline"
                rules={{ required: "Registration deadline is required" }}
                error={errors.registrationDeadline?.message}
                isRequired
                maxDate={maxRegistrationDeadline}
              />
              <FormTimeRange
                control={control}
                startName="startTime"
                endName="endTime"
                label="Event Time"
                startLabel="Start time"
                endLabel="End time"
                error={errors.startTime?.message || errors.endTime?.message}
              />
            </div>

            <Divider />

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect
                name="versionId"
                label="Version"
                options={versionOptions}
                rules={{ required: "Please select a version" }}
                isLoading={versionsLoading}
              />
              <FormComboBox
                control={control}
                name="categoryId"
                label="Category"
                options={categoryOptions}
                placeholder={
                  categoriesLoading ? "Loading categories…" : "Select a category"
                }
                searchPlaceholder="Search categories…"
                emptyText="No categories found"
                disabled={categoriesLoading}
                rules={{ required: "Please select a category" }}
                error={errors.categoryId?.message}
                action={{
                  label: "Add new category",
                  onSelect: () =>
                    navigate("/content-management/events/categories/add"),
                }}
              />
              <FormMultiComboBox
                control={control}
                name="speakerIds"
                label="Speakers"
                options={speakerOptions}
                placeholder={
                  isFetching
                    ? "Loading…"
                    : !selectedVersionId
                      ? "Select a version first"
                      : speakersLoading
                        ? "Loading speakers…"
                        : "Select speakers"
                }
                searchPlaceholder="Search speakers…"
                emptyText="No speakers found"
                disabled={isFetching || (!selectedVersionId && !isEdit) || speakersLoading}
                error={errors.speakerIds?.message}
              />
              <FormInput
                name="location"
                label="Location"
                placeholder="Hall A, Kathmandu"
                rules={{ required: "Location is required" }}
              />
              <FormInput
                name="totalSeats"
                label="Total Seats"
                type="number"
                placeholder="Leave blank for unlimited"
                rules={{
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 100, message: "Total seats must not exceed 100" },
                }}
              />
              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="1"
                rules={{
                  required: "Display order is required",
                  min: { value: 1, message: "Must be at least 1" },
                }}
                isRequired
              />
            </div>

            <Divider />

            {/* Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect
                name="eventType"
                label="Event Type"
                options={eventTypeOptions}
                rules={{ required: "Event type is required" }}
              />
              {isGroup && (
                <FormInput
                  name="maxParticipants"
                  label="Max Participants per Team"
                  type="number"
                  placeholder="e.g. 4"
                  rules={{
                    required: "Max participants is required for group events",
                    min: { value: 1, message: "Must be at least 1" },
                    max: { value: 20, message: "Cannot exceed 20 participants" },
                  }}
                  isRequired
                />
              )}
            </div>

            <Divider />

            {/* External registration */}
            <div className="grid grid-cols-1 gap-2">
              <FormInput
                name="registerLink"
                label="External Registration Link"
                placeholder="https://forms.gle/…"
                rules={{
                  maxLength: { value: 500, message: "Max 500 characters" },
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: "Must be a valid URL (http:// or https://)",
                  },
                }}
              />
              <Text size="xs" variant="muted">
                Optional. If set, the Register button sends users straight to
                this URL instead of the in-app registration form.
              </Text>
            </div>

            <Divider />

            {/* Pricing & status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect
                name="feeType"
                label="Fee Type"
                options={feeTypeOptions}
                rules={{ required: "Fee type is required" }}
              />
              {isPaid && (
                <FormInput
                  name="fee"
                  label="Fee"
                  placeholder="e.g. 500"
                  rules={{ required: "Fee is required for paid events" }}
                />
              )}
              <div className={isPaid ? undefined : "md:col-span-2"}>
                <FormSelect
                  name="status"
                  label="Status"
                  options={statusOptions}
                  rules={{ required: "Status is required" }}
                />
              </div>
            </div>

            {/* Highlighted toggle */}
            <Controller
              control={control}
              name="isHighlighted"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    onClick={toggleHighlighted}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      field.value ? "bg-accent" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        field.value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Highlighted</span>
                    <span className="text-xs text-muted-foreground">
                      Feature this event in the highlights section
                    </span>
                  </div>
                </div>
              )}
            />

            <Divider />

            {/* Image */}
            <FormFileUpload
              name="image"
              label="Image"
              isRequired={!isEdit}
              accept="image/*"
              preview={imagePreview}
              onFileChange={handleImageChange}
              title="Drop your event image here"
              hint="SVG, PNG, or JPG · max 150 KB"
            />

            <Divider />

            {/* Description — last */}
            <FormMarkdown
              name="description"
              label="Description"
              placeholder="Describe the event (markdown supported)"
              isRequired
              rules={{ required: "Description is required" }}
            />
          </div>

          {/* Fixed footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>{isEdit ? "Update Event" : "Create Event"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
