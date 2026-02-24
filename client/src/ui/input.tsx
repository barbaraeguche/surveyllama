import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, useState } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === "password";
    
    return (
      <div className={"relative w-full"}>
        <input
          {...props}
          ref={ref}
          type={isPassword && showPassword ? "text" : props.type}
          className={cn(
            "w-full rounded-md p-2 border text-sm shadow-xs placeholder:text-xs placeholder:text-gray-500 " +
            "focus:placeholder:text-gray-400 focus-visible:outline focus-visible:outline-offset-2 " +
            "focus-visible:outline-foreground/40",
            isPassword && "pr-10",
            props.className
          )}
        />
        
        {isPassword && (
          <button
            type={"button"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={"absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeClosed size={18}/> : <Eye size={18}/>}
          </button>
        )}
      </div>
    );
  });