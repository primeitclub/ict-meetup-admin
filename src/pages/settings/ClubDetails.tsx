import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import FormInput from "../../components/form-field/input-field/InputController";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSiteSettings } from "./use-site-settings";

interface ClubDetailsFormValues {
  clubEmail: string;
  clubPhoneNumber: string;
}

export default function ClubDetails() {
  const { settings, isLoading, save, isSaving } = useSiteSettings();

  const methods = useForm<ClubDetailsFormValues>({
    defaultValues: { clubEmail: "", clubPhoneNumber: "" },
  });
  const { handleSubmit, reset } = methods;

  // Pre-fill the form once the singleton record loads.
  useEffect(() => {
    if (settings) {
      reset({
        clubEmail: settings.clubEmail || "",
        clubPhoneNumber: settings.clubPhoneNumber || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: ClubDetailsFormValues) => {
    await save((fd) => {
      fd.append("clubEmail", data.clubEmail.trim());
      fd.append("clubPhoneNumber", data.clubPhoneNumber.trim());
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-medium">Club Details</h2>
        <Text size="sm" variant="muted">
          The club's official contact email and phone number, shown across the whole site.
        </Text>
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="clubEmail"
                label="Club Email"
                type="email"
                placeholder="club@prime.edu.np"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                }}
              />
              <FormInput
                name="clubPhoneNumber"
                label="Club Phone Number"
                placeholder="+977 98XXXXXXXX"
                rules={{
                  maxLength: { value: 20, message: "Max 20 characters" },
                }}
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
