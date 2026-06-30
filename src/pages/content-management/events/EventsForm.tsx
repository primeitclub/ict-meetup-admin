import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../../components/form-field/input-field/InputController";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import FormComboBox from "../../../components/form-field/combobox/FormComboBox";
import Textarea from "../../../components/form-field/Textarea";
import FormDateRange from "../../../components/form-field/date-picker/FormDateRange";
import FormTimeRange from "../../../components/form-field/time-picker/FormTimeRange";
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
  speakerId: string;
  totalSeats: string;
  feeType: EventFeeType | "";
  fee: string;
  location: string;
  status: EventStatus | "";
  registrationDeadline: string;
  displayOrder: string;
  isHighlighted: boolean;
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

export default function EventsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);

  const { options: versionOptions, isLoading: versionsLoading } =
    useGetVersionOptions();

  const { data: categoriesData, isLoading: categoriesLoading } = useApiQuery(
    "eventCategories",
  )<{ data: { items: EventCategory[] } }>();

  const { data: speakersData, isLoading: speakersLoading } = useApiQuery(
    "speakers",
  )<{ data: { items: Speaker[] } }>();

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data?.items ?? []).map((category) => ({
        label: category.displayName || category.name,
        value: category.id,
      })),
    [categoriesData],
  );

  const speakerOptions = useMemo(
    () =>
      (speakersData?.data?.items ?? []).map((speaker) => ({
        label: speaker.name,
        value: speaker.id,
      })),
    [speakersData],
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
      speakerId: "",
      totalSeats: "",
      feeType: "",
      fee: "",
      location: "",
      status: "",
      registrationDeadline: "",
      displayOrder: "",
      isHighlighted: false,
    },
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const isPaid = watch("feeType") === "paid";
  const isHighlighted = watch("isHighlighted");
  const toggleHighlighted = useCallback(
    () => setValue("isHighlighted", !isHighlighted, { shouldDirty: true }),
    [isHighlighted, setValue],
  );

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
        startTime: ev.startTime ?? "",
        endTime: ev.endTime ?? "",
        date: ev.date ? ev.date.split("T")[0] : "",
        categoryId: ev.categoryId ?? "",
        versionId: ev.versionId ?? "",
        speakerId: ev.speakerId ?? "",
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
      });
    }
  }, [existingData, reset]);

  useEffect(() => {
    if (!isEdit) {
      reset({
        title: "",
        subtitle: "",
        description: "",
        startTime: "",
        endTime: "",
        date: "",
        categoryId: "",
        versionId: "",
        speakerId: "",
        totalSeats: "",
        feeType: "",
        fee: "",
        location: "",
        status: "",
        registrationDeadline: "",
        displayOrder: "",
      });
    }
  }, [isEdit, reset]);

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
      formData.append(key, String(value));
    });
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
            <div className="grid grid-cols-2 gap-6">
              <FormDateRange
                control={control}
                startName="registrationDeadline"
                endName="date"
                label="Event Date Range"
                rules={{ required: "Event date is required" }}
                error={
                  errors.date?.message || errors.registrationDeadline?.message
                }
                isRequired
                placeholder="Registration deadline → Event date"
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
              <FormComboBox
                control={control}
                name="speakerId"
                label="Speaker"
                options={speakerOptions}
                placeholder={
                  speakersLoading ? "Loading speakers…" : "Select a speaker"
                }
                searchPlaceholder="Search speakers…"
                emptyText="No speakers found"
                disabled={speakersLoading}
                error={errors.speakerId?.message}
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
                placeholder="100"
                rules={{
                  required: "Total seats is required",
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 100, message: "Total seats must not exceed 100" },
                }}
                isRequired
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
              hint="SVG, PNG, or JPG · max 2 MB"
            />

            <Divider />

            {/* Description — last */}
            <Textarea
              label="Description"
              placeholder="Describe the event"
              isRequired
              {...register("description", {
                required: "Description is required",
              })}
              error={errors.description?.message}
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
