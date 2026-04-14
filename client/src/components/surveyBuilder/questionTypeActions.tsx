import { Button } from "../ui";
import { QuestionType } from "../../types";

const QUESTION_TYPE_ACTIONS: Array<{
  label: string;
  type: QuestionType;
}> = [
  { label: "+ Multiple Choice", type: "multiple_choice" },
  { label: "+ Checkbox", type: "checkbox" },
  { label: "+ Short Answer", type: "short_answer" },
  { label: "+ Rating Scale", type: "rating" },
];

type QuestionTypeActionsProps = {
  onAddQuestion: (type: QuestionType) => void;
};

export default function QuestionTypeActions({
  onAddQuestion,
}: QuestionTypeActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center pt-8">
      {QUESTION_TYPE_ACTIONS.map((action) => (
        <Button
          key={action.type}
          type="button"
          onClick={() => onAddQuestion(action.type)}
          className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
