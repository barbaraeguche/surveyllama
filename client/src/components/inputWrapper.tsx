import { InputError } from "@/components/inputError";
import type { InputConfig } from "@/lib/types";
import { Input } from "@/ui";
import { clsx } from "clsx";
import { type ComponentProps, forwardRef } from "react";
import type { FieldError } from "react-hook-form";

type InputWrapperProps = {
  config: InputConfig;
  error?: FieldError | undefined;
} & Omit<ComponentProps<typeof Input>, "ref">;

export default forwardRef<HTMLInputElement, InputWrapperProps>(
  function InputWrapper(props, ref) {
    return (
      <div>
        {/* label */}
        {props.config.label && (
          <label
            htmlFor={props.name}
            className={clsx("mb-1 block text-sm font-medium", {
              "text-red-500": props.error
            })}
          >
            {props.config.label}
          </label>
        )}
        
        {/* input */}
        <Input
          {...props}
          ref={ref}
          id={props.name}
          className={clsx(props.className,
            { "bg-white": props },
            { "bg-gray-100/90": props.disabled },
            { "border-red-500 focus-visible:border-foreground/20": props.error },
            { "focus:outline-none": props.readOnly }
          )}
          placeholder={props.config.placeholder}
          aria-describedby={`${props.name}-error`}
        />
        
        {/* error */}
        <InputError
          id={`${props.name}-error`}
          message={props.error?.message}
        />
      </div>
    );
  });