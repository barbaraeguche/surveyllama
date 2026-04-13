import { MessageSquare } from "lucide-react";

import BarChartComponent from "../BarChartComponent";
import CheckboxChartComponent from "../CheckboxChartComponent";
import { Card } from "../UI";
import { AnalyticsQuestion } from "../../types";

type AnalyticsQuestionCardProps = {
  question: AnalyticsQuestion;
  index: number;
};

function formatQuestionTypeLabel(type: AnalyticsQuestion["type"]) {
  return type.replace(/_/g, " ");
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
      <MessageSquare size={32} className="mb-2 opacity-20" />
      <p className="italic text-sm">No responses yet.</p>
    </div>
  );
}

function ShortAnswerList({ answers }: { answers: string[] }) {
  if (answers.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-10">
        <MessageSquare size={32} className="mb-2 opacity-20" />
        <p className="italic text-sm">No responses yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {answers.map((answer, index) => (
        <div
          key={`${index}-${answer}`}
          className="p-4 bg-neutral-50 rounded-xl text-sm border border-neutral-100 leading-relaxed"
        >
          "{answer}"
        </div>
      ))}
    </div>
  );
}

function QuestionVisualization({ question }: { question: AnalyticsQuestion }) {
  const hasResponses = question.data.length > 0;

  if (question.type === "short_answer") {
    const answers = question.data.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    return <ShortAnswerList answers={answers} />;
  }

  if (question.type === "multiple_choice") {
    const multiSelectResponses = question.data.filter(
      (value): value is string[] => Array.isArray(value),
    );

    if (multiSelectResponses.length > 0) {
      return <CheckboxChartComponent data={multiSelectResponses} />;
    }

    const chartData = question.data.filter(
      (value): value is string | number =>
        typeof value === "string" || typeof value === "number",
    );

    return <BarChartComponent data={chartData} options={question.options} />;
  }

  if (!hasResponses) {
    return <EmptyState />;
  }

  if (question.type === "checkbox") {
    const checkboxResponses = question.data.filter((value): value is string[] =>
      Array.isArray(value),
    );

    return <CheckboxChartComponent data={checkboxResponses} />;
  }

  if (question.type === "rating") {
    const chartData = question.data.filter(
      (value): value is string | number =>
        typeof value === "string" || typeof value === "number",
    );

    return <BarChartComponent data={chartData} options={question.options} />;
  }

  return <EmptyState />;
}

export default function AnalyticsQuestionCard({
  question,
  index,
}: AnalyticsQuestionCardProps) {
  return (
    <Card key={question.id} className="p-8 flex flex-col min-w-0">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
            Question {index + 1}
          </span>
          <span className="text-xs text-neutral-400">
            • {formatQuestionTypeLabel(question.type)}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-tight">{question.text}</h3>
      </div>

      <div className="h-75 w-full min-w-0">
        <QuestionVisualization question={question} />
      </div>
    </Card>
  );
}
