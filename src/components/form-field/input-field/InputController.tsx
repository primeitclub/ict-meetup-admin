import { type InputHTMLAttributes } from 'react';
import { Controller, useFormContext, type RegisterOptions } from 'react-hook-form';
import Input from './Input';

interface FormInputInterface extends InputHTMLAttributes<HTMLInputElement> {
    name: string,
    label?: string,
    rules?: RegisterOptions,
    /** Show a required asterisk. Defaults to whether `rules.required` is set. */
    isRequired?: boolean
}

const FormInput = ({name, label, rules, isRequired, ...props}: FormInputInterface)=>{

    const {control} = useFormContext();
    const required = isRequired ?? Boolean(rules?.required);

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            // `fieldState` resolves nested names (e.g. "depts.0.contacts.1.phone")
            // that a flat errors[name] lookup would miss.
            render={ ({field:{name,onChange,value,ref}, fieldState:{error}})=>(
                <Input
                label={label}
                isRequired={required}
                name={name}
                onChange={onChange}
                value={value}
                ref={ref}
                error={error?.message}
                {...props}
                />
            ) }
        />
    )
}

export default FormInput;