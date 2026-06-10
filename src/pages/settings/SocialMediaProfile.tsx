import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Plus, Save, Trash2 } from "lucide-react";
import FormInput from "../../components/form-field/input-field/InputController";
import FormSelect from "../../components/form-field/input-select/SelectController";
import Divider from "../../shared/design-components/divider/Divider";
import { Text } from "../../shared/design-components";
import { useSettingsForVersion, useSaveSettings } from "./use-settings";
import SettingsVersionBar from "./SettingsVersionBar";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "../../types/settings";

interface SocialFormValues {
  links: { platform: SocialPlatform | ""; link: string }[];
}

const platformOptions = SOCIAL_PLATFORMS.map((p) => ({ label: p, value: p }));

const urlRule = {
  required: "Link is required",
  pattern: { value: /^https?:\/\/.+/, message: "Must be a valid URL" },
};

export default function SocialMediaProfile() {
  const {
    versionOptions,
    selectedVersionId,
    setVersion,
    settings,
    exists,
    isArchived,
    refetchSettings,
  } = useSettingsForVersion();

  const methods = useForm<SocialFormValues>({
    defaultValues: { links: [] },
  });
  const { control, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  useEffect(() => {
    reset({
      links: (settings?.socialMediaLinks ?? []).map((l) => ({
        platform: l.platform,
        link: l.link,
      })),
    });
  }, [settings, reset]);

  const { save, isSaving } = useSaveSettings({
    exists,
    settingsId: settings?.id,
    onSaved: refetchSettings,
  });

  const onSubmit = async (data: SocialFormValues) => {
    const links = data.links
      .filter((l) => l.platform && l.link.trim())
      .map((l) => ({ platform: l.platform, link: l.link.trim() }));
    await save(selectedVersionId, (fd) => {
      // Multipart → send the array as a JSON string; the server parses it.
      fd.append("socialMediaLinks", JSON.stringify(links));
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      <div className="p-6">
        <SettingsVersionBar
          title="Social Media Profile"
          description="Links shown for this version. Allowed platforms: Facebook, Instagram, LinkedIn, Twitter, TikTok."
          versionOptions={versionOptions}
          selectedVersionId={selectedVersionId}
          onVersionChange={(v) => setVersion(v)}
          isArchived={isArchived}
        />
      </div>

      <Divider />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {fields.length === 0 && (
              <Text size="sm" variant="muted">
                No social links yet. Add one below.
              </Text>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[12rem_1fr_auto] gap-4 items-start"
              >
                <FormSelect
                  name={`links.${index}.platform`}
                  label="Platform"
                  options={platformOptions}
                  rules={{ required: "Required" }}
                />
                <FormInput
                  name={`links.${index}.link`}
                  label="Link"
                  placeholder="https://instagram.com/ictmeetup"
                  rules={urlRule}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-7 inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove link"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ platform: "", link: "" })}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
            >
              <Plus size={16} />
              Add social link
            </button>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <button
              type="submit"
              disabled={isSaving || isArchived || !selectedVersionId}
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
