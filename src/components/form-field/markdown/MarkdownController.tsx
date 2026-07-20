import {
  Controller,
  useFormContext,
  type RegisterOptions,
} from "react-hook-form";
import MarkdownField from "./MarkdownField";

interface FormMarkdownProps {
  name: string;
  label?: string;
  rules?: RegisterOptions;
  /** Show a required asterisk. Defaults to whether `rules.required` is set. */
  isRequired?: boolean;
  placeholder?: string;
}

/**
 * react-hook-form wrapper around the markdown editor. The field value is the
 * raw markdown source — loads existing markdown on edit and submits it as-is.
 */
const FormMarkdown = ({
  name,
  label,
  rules,
  isRequired,
  placeholder,
}: FormMarkdownProps) => {
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
        <MarkdownField
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

export default FormMarkdown;
