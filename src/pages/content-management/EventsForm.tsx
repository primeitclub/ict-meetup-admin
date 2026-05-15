import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { ChevronRight, Upload, X } from "lucide-react";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import useGetVersions from "../../lib/hooks/use-get-versions";
import { EventVersionStatus } from "../../types/version";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { Event, CreateEventPayload } from "../../types/event";
import toast from "react-hot-toast";

const feeTypeOptions = [
  { label: "Free", value: "Free" },
  { label: "Paid", value: "Paid" },
];

const locationOptions = [
  { label: "Prithvi Hall", value: "Prithvi Hall" },
  { label: "Sagarmatha Hall", value: "Sagarmatha Hall" },
  { label: "Online", value: "Online" },
];

export default function EventsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: versionsData, isLoading: versionsLoading } = useGetVersions();
  
  const { execute: createEvent, isLoading: isCreating } = useApiMutation("events")<
    { data: Event },
    CreateEventPayload
  >({ method: "POST", invalidateRoutes: ["events"] });

  const { execute: updateEvent, isLoading: isUpdating } = useApiMutation("eventDetail")<
    { data: Event },
    CreateEventPayload
  >({ method: "PUT", invalidateRoutes: ["events"] });

  const { data: editData } = useApiQuery("eventDetail")<{ data: Event }>({
    pathParams: { eventId: id! },
    enabled: isEditMode,
  });

  const versionOptions = versionsData?.data.items
    .filter((item) => item.status === EventVersionStatus.DRAFT || item.status === EventVersionStatus.PUBLISHED)
    .map((item) => ({ label: item.version_name, value: item.id }));

  const methods = useForm<CreateEventPayload>({
    defaultValues: {
      title: "",
      description: "Default description", // Placeholder if not in UI
      eventDate: "",
      startTime: "",
      endTime: "",
      totalSeats: 0,
      registrationDeadline: "",
      displayOrder: 0,
      flagshipEventVersionId: "",
      speakerName: "",
      feeType: "",
      location: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
  } = methods;

  useEffect(() => {
    if (editData?.data) {
      const event = editData.data;
      reset({
        title: event.title,
        description: event.description || "Default description",
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
        startTime: event.startTime,
        endTime: event.endTime,
        totalSeats: event.totalSeats,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
        displayOrder: event.displayOrder,
        flagshipEventVersionId: event.flagshipEventVersionId,
        speakerName: event.speakerName,
        feeType: event.feeType,
        location: event.location,
      });
      if (event.image) setImagePreview(event.image);
    }
  }, [editData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const onSubmit = async (formData: CreateEventPayload) => {
    try {
      if (isEditMode) {
        await updateEvent(formData, { pathParams: { eventId: id! } });
        toast.success("Event updated successfully");
      } else {
        await createEvent(formData);
        toast.success("Event created successfully");
      }
      navigate(-1);
    } catch (error: any) {
      toast.error(error.message || (isEditMode ? "Failed to update event" : "Failed to create event"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/content-management" className="text-[#CCCCCC] hover:text-white transition-colors">
          Content management
        </Link>
        <ChevronRight size={14} className="text-[#E6E6E6] rotate-0" />
        <Link to="/content-management/events" className="text-[#CCCCCC] hover:text-white transition-colors">
          Events
        </Link>
        <ChevronRight size={14} className="text-[#E6E6E6] rotate-0" />
        <span className="text-[#E6E6E6] font-bold">Add events</span>
      </nav>

      <div className="space-y-1">
        <h2 className="text-[28px] font-semibold text-[#E6E6E6]">Fill below fields</h2>
        <p className="text-[#CCCCCC] text-sm">
          Provide the details below to add new event content. Please ensure all information is accurate before submitting the form.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Enter event title"
                rules={{ required: "Title is required" }}
              />

              <div className="space-y-2">
                <label className="block text-base text-[#E6E6E6]">Attach Image File (.jpg, .png, .pdf)</label>
                <div className="relative border-2 border-dashed border-[#031C33] rounded-xl bg-[#02111F] h-[235px] flex flex-col items-center justify-center p-10 text-center group hover:border-[#3571F0] transition-colors overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(null); setValue("image", ""); }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white z-10"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-[#E6E6E6] rounded-full flex items-center justify-center mb-3">
                        <Upload size={24} className="text-[#010B14]" />
                      </div>
                      <p className="text-[#E6E6E6] text-base">Click to upload or drag and drop</p>
                      <p className="text-[#CCCCCC] text-xs">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <FormInput
                name="eventDate"
                label="Event Date"
                type="date"
                placeholder="Select event date"
                rules={{ required: "Event date is required" }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="startTime"
                  label="Start & End Time"
                  type="time"
                  placeholder="Select event time"
                  rules={{ required: "Start time is required" }}
                />
                <div className="pt-8">
                  <FormInput
                    name="endTime"
                    label=""
                    type="time"
                    placeholder="Select event time"
                    rules={{ required: "End time is required" }}
                  />
                </div>
              </div>

              <FormInput
                name="totalSeats"
                label="Total Seat"
                type="number"
                placeholder="Enter total seat occupied"
                rules={{ required: "Total seats required", min: 0 }}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <FormInput
                name="registrationDeadline"
                label="Registration Closed Deadline"
                type="date"
                placeholder="Select registration closed date"
                rules={{ required: "Registration deadline is required" }}
              />

              <FormInput
                name="displayOrder"
                label="Display Order"
                type="number"
                placeholder="Enter display order"
                rules={{ required: "Display order is required", min: 1 }}
              />

              <FormSelect
                name="flagshipEventVersionId"
                label="Flagship Version"
                options={versionOptions ?? []}
                rules={{ required: "Please select a flagship version" }}
                isLoading={versionsLoading}
                placeholder="Select flagship version"
              />

              <FormInput
                name="speakerName"
                label="Speaker Name"
                placeholder="Enter speaker name"
                rules={{ required: "Speaker name is required" }}
              />

              <FormSelect
                name="feeType"
                label="Fee Type"
                options={feeTypeOptions}
                placeholder="Select fee Type"
                rules={{ required: "Fee type is required" }}
              />

              <FormSelect
                name="location"
                label="Location"
                options={locationOptions}
                placeholder="Select Location"
                rules={{ required: "Location is required" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-xl border border-[#6D57E8] text-white hover:bg-[#6D57E8]/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-2 rounded-xl bg-[#3571F0] text-white hover:bg-[#3571F0]/90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-admin-primary focus:ring-[#3571F0] transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}


