import { GripVertical, Trash2 } from "lucide-react";

import { Card, Button, Input } from "../ui";
import { Question } from "../../types";

const RATING_SCALE_VALUES = [1, 2, 3, 4, 5];

type QuestionEditorCardProps = {
  question: Question;
  onQuestionChange: (questionId: string, updates: Partial<Question>) => void;
  onRemoveQuestion: (questionId: string) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (
    questionId: string,
    optionIndex: number,
    value: string,
  ) => void;
  onRemoveOption: (questionId: string, optionIndex: number) => void;
};

function formatQuestionTypeLabel(type: Question["type"]) {
  return type.replace(/_/g, " ");
}

function supportsOptions(type: Question["type"]) {
  return type === "multiple_choice" || type === "checkbox";
}

export default function QuestionEditorCard({
  question,
  onQuestionChange,
  onRemoveQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuestionEditorCardProps) {
  return (
    <Card className="p-6 relative group">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={24} />
      </div>

      <div className="flex justify-between items-start mb-4 ml-6">
        <div className="grow mr-4">
          <Input
            placeholder="Enter your question here..."
            value={question.text}
            onChange={(event) =>
              onQuestionChange(question.id, { text: event.target.value })
            }
            className="font-medium"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
            {formatQuestionTypeLabel(question.type)}
          </span>
          <button
            type="button"
            onClick={() => onRemoveQuestion(question.id)}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="ml-6 space-y-4">
        {supportsOptions(question.type) && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div
                key={`${question.id}-${index}`}
                className="flex gap-2 items-center"
              >
                <div
                  className={`w-4 h-4 border border-neutral-300 ${
                    question.type === "multiple_choice"
                      ? "rounded"
                      : "rounded-full"
                  }`}
                />
                <Input
                  value={option}
                  onChange={(event) =>
                    onUpdateOption(question.id, index, event.target.value)
                  }
                  className="h-8 text-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveOption(question.id, index)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {question.options.length < 10 && (
              <Button
                type="button"
                onClick={() => onAddOption(question.id)}
                className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 text-xs py-1 h-auto"
              >
                + Add Option
              </Button>
            )}
          </div>
        )}

        {question.type === "rating" && (
          <div className="flex gap-2 text-neutral-400">
            {RATING_SCALE_VALUES.map((value) => (
              <div
                key={value}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-xs"
              >
                {value}
              </div>
            ))}
          </div>
        )}

        {question.type === "short_answer" && (
          <div className="border-b border-dashed border-neutral-300 py-2 text-neutral-400 text-sm">
            Participant will type their answer here...
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-neutral-50">
          <input
            type="checkbox"
            id={`req-${question.id}`}
            checked={question.required}
            onChange={(event) =>
              onQuestionChange(question.id, { required: event.target.checked })
            }
            className="rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor={`req-${question.id}`}
            className="text-xs text-neutral-500"
          >
            Required question
          </label>
        </div>
      </div>
    </Card>
  );
}
