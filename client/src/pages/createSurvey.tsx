import InputWrapper from "@/components/inputWrapper";
import { createSurveySchema, type CreateSurveySchemaType } from "@/schemas/administratorSchema";
import { Button } from "@/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";

export default function CreateSurvey() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    reValidateMode: "onBlur",
    resolver: zodResolver(createSurveySchema),
  });
  
  const onSubmit: SubmitHandler<CreateSurveySchemaType> = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        {/* title */}
        <InputWrapper
          {...register("title")}
          config={{
            label: "Title",
            placeholder: "Enter title",
          }}
          name={"title"}
          error={errors.title}
        />
        
        {/* description */}
        <InputWrapper
          {...register("description")}
          config={{
            label: "Description",
            placeholder: "Enter description",
          }}
          name={"description"}
          error={errors.description}
        />
        
        {/* expiry date */}
        <InputWrapper
          type={"date"}
          {...register("expiryDate")}
          config={{
            label: "Expiry date",
            placeholder: "Enter expiry date",
          }}
          name={"expiryDate"}
          error={errors.expiryDate}
        />
      </div>
      
      <Button type={"submit"}>
        Click me
      </Button>
    </form>
  );
}