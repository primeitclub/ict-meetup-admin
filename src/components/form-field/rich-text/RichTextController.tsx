import {
  Controller,
  useFormContext,
  type RegisterOptions,
} from "react-hook-form";
import RichText from "./RichText";

interface FormRichTextProps {
  name: string;
  label?: string;
  rules?: RegisterOptions;
  /** Show a required asterisk. Defaults to whether `rules.required` is set. */
  isRequired?: boolean;
  placeholder?: string;
}

/**
 * react-hook-form wrapper around the bold/italic RichText editor. The field
 * value is the editor's HTML string — loads existing HTML on edit and emits
 * `editor.getHTML()` on change, so the form submits the HTML as-is.
 */
const FormRichText = ({
  name,
  label,
  rules,
  isRequired,
  placeholder,
}: FormRichTextProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const required = isRequired ?? Boolean(rules?.required);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { name, value, onChange, onBlur } }) => (
        <RichText
          name={name}
          label={label}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          isRequired={required}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );
};

export default FormRichText;
