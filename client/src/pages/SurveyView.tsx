import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Input, Card } from "../components/UI";
import { Survey, Question } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { surveyService } from "../services/surveyService";

type AnswerValue = string | number | string[];

function isQuestionAnswered(
  question: Question,
  value: AnswerValue | undefined,
) {
  if (question.type === "multiple_choice") {
    return Array.isArray(value) && value.length > 0;
  }

  if (question.type === "checkbox") {
    return typeof value === "string" && value.trim().length > 0;
  }

  if (question.type === "short_answer") {
    return typeof value === "string" && value.trim().length > 0;
  }

  return value !== undefined && value !== null;
}

function toggleOptionSelection(
  selectedOptions: string[],
  option: string,
  checked: boolean,
) {
  if (checked) {
    return selectedOptions.includes(option)
      ? selectedOptions
      : [...selectedOptions, option];
  }

  return selectedOptions.filter((selectedOption) => selectedOption !== option);
}

function getSelectedOptions(value: AnswerValue | undefined) {
  return Array.isArray(value) ? value : [];
}

export default function SurveyView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const displayQuestions = useMemo(() => {
    if (!survey?.questions) {
      return [];
    }

    const questions = [...survey.questions];
    if (survey.settings?.display_order === "random") {
      questions.sort(() => Math.random() - 0.5);
    }

    return questions;
  }, [survey]);

  const fetchSurvey = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data, error } = await surveyService.getById(id);

    if (error) {
      setError(error);
    } else if (data) {
      setSurvey(data);
    }
    setLoading(false);
  };

  const handleAnswerChange = (qId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const missingRequired = survey?.questions?.filter(
      (question) =>
        question.required &&
        !isQuestionAnswered(question, answers[question.id]),
    );
    if (missingRequired && missingRequired.length > 0) {
      setError("Please answer all required questions.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error } = await surveyService.submitResponse(id!, {
      email,
      answers,
      token,
    });

    if (error) {
      setError(error);
      setIsSubmitting(false);
    } else {
      setSubmitted(true);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-neutral-400">
        Loading survey...
      </div>
    );

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <Card className="p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={fetchSurvey}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!survey)
    return <div className="text-center py-20">Survey not found.</div>;
  if (!survey.is_published)
    return (
      <div className="text-center py-20">This survey is not yet published.</div>
    );

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="p-12">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-neutral-600">
              {survey.settings?.thank_you_message ||
                "Your responses have been successfully submitted. We appreciate your feedback."}
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">{survey.title}</h1>
        {survey.description && (
          <p className="text-neutral-600 text-lg">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!survey.settings?.is_anonymous && (
          <Card className="p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Card>
        )}

        {displayQuestions.map((q, idx) => (
          <Card key={q.id} className="p-6">
            <div className="flex items-start gap-2 mb-6">
              <span className="text-neutral-400 font-mono mt-1">
                {idx + 1}.
              </span>
              <h3 className="text-xl font-medium">
                {q.text}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            </div>

            <div className="space-y-3">
              {q.type === "multiple_choice" && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={getSelectedOptions(answers[q.id]).includes(
                          opt,
                        )}
                        onChange={(e) => {
                          const currentSelection = getSelectedOptions(
                            answers[q.id],
                          );
                          handleAnswerChange(
                            q.id,
                            toggleOptionSelection(
                              currentSelection,
                              opt,
                              e.target.checked,
                            ),
                          );
                        }}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "checkbox" && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`single-select-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswerChange(q.id, opt)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "short_answer" && (
                <textarea
                  className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  required={q.required}
                />
              )}

              {q.type === "rating" && (
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, n)}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${
                        answers[q.id] === n
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                          : "border-neutral-100 hover:border-neutral-200 text-neutral-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Button
          type="submit"
          className="w-full py-6 text-xl rounded-xl shadow-lg shadow-indigo-200"
        >
          Submit Survey
        </Button>
      </form>
    </div>
  );
}
