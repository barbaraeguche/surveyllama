import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../components/UI";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import {
  Question,
  QuestionType,
  Survey,
  SurveySettings,
  SurveyUpsertPayload,
} from "../types";
import { Reorder } from "motion/react";
import { surveyService } from "../services/surveyService";
import SurveyBasicsCard from "../components/survey-builder/SurveyBasicsCard";
import SurveySettingsCard from "../components/survey-builder/SurveySettingsCard";
import QuestionEditorCard from "../components/survey-builder/QuestionEditorCard";
import QuestionTypeActions from "../components/survey-builder/QuestionTypeActions";

const DEFAULT_THANK_YOU_MESSAGE = "Thank you for participating in our survey!";

/** Matches unchanged auto-generated option labels such as "Option 1", "Option 12". */
const PLACEHOLDER_OPTION_PATTERN = /^Option \d+$/i;

/** 
 * Strips all HTML tags from a string to prevent stored XSS.
 * @param value - The string to sanitize.
 * @returns A sanitized string with HTML tags removed.
 */
function sanitizeText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  is_anonymous: false,
  display_order: "sequential",
  thank_you_message: DEFAULT_THANK_YOU_MESSAGE,
};

type SurveyFormState = {
  title: string;
  description: string;
  expiryDate: string;
  settings: SurveySettings;
  questions: Question[];
};

function createEmptyFormState(): SurveyFormState {
  return {
    title: "",
    description: "",
    expiryDate: "",
    settings: { ...DEFAULT_SURVEY_SETTINGS },
    questions: [],
  };
}

function createQuestion(type: QuestionType): Question {
  return {
    id: crypto.randomUUID(),
    type,
    text: "",
    options:
      type === "multiple_choice" || type === "checkbox" ? ["Option 1"] : [],
    required: false,
  };
}

function normalizeQuestion(question: Question): Question {
  return {
    id: question.id,
    type: question.type,
    text: question.text ?? "",
    options: question.options ?? [],
    required: question.required ?? false,
  };
}

function mapSurveyToFormState(survey: Survey): SurveyFormState {
  return {
    title: survey.title,
    description: survey.description || "",
    expiryDate: survey.expiry_date || "",
    settings: {
      is_anonymous:
        survey.settings?.is_anonymous ?? DEFAULT_SURVEY_SETTINGS.is_anonymous,
      display_order:
        survey.settings?.display_order ?? DEFAULT_SURVEY_SETTINGS.display_order,
      thank_you_message:
        survey.settings?.thank_you_message ??
        DEFAULT_SURVEY_SETTINGS.thank_you_message,
    },
    questions: (survey.questions ?? []).map(normalizeQuestion),
  };
}

function validateSurveyForm(formState: SurveyFormState) {
  if (!formState.title.trim()) {
    return "Please enter a survey title.";
  }

  if (formState.questions.length === 0) {
    return "Please add at least one question.";
  }

  for (const question of formState.questions) {
    if (!question.text.trim()) {
      return "Each question needs text before the survey can be saved.";
    }

    if (question.type === "multiple_choice" || question.type === "checkbox") {
      if (question.options.length < 2) {
        return "Choice-based questions must have at least 2 options.";
      }

      if (question.options.some((option) => !option.trim())) {
        return "Choice-based questions cannot contain empty options.";
      }

      if (
        question.options.some((option) =>
          PLACEHOLDER_OPTION_PATTERN.test(option.trim()),
        )
      ) {
        return 'Please replace default placeholder options (e.g. \"Option 1\") with real answer choices.';
      }
    }
  }

  if (formState.expiryDate) {
    const minExpiry = new Date();
    minExpiry.setDate(minExpiry.getDate() + 7);
    if (new Date(formState.expiryDate) < minExpiry) {
      return "Expiry date must be at least one week from today.";
    }
  }

  return null;
}

export default function CreateSurvey() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formState, setFormState] =
    useState<SurveyFormState>(createEmptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [isPublishedSurvey, setIsPublishedSurvey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    let isActive = true;

    const loadSurvey = async () => {
      setLoading(true);
      setError(null);

      const { data, error: serviceError } = await surveyService.getById(id);

      if (!isActive) {
        return;
      }

      if (serviceError) {
        setError(serviceError);
      } else if (data) {
        setFormState(mapSurveyToFormState(data));
        setIsPublishedSurvey(data.is_published);

        if (data.is_published) {
          setError(
            "This survey is currently published and cannot be edited. Please unpublish it first.",
          );
        }
      }

      setLoading(false);
    };

    void loadSurvey();

    return () => {
      isActive = false;
    };
  }, [id, isEdit]);

  const addQuestion = (type: QuestionType) => {
    setFormState((current) => ({
      ...current,
      questions: [...current.questions, createQuestion(type)],
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setFormState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    }));
  };

  const removeQuestion = (questionId: string) => {
    setFormState((current) => ({
      ...current,
      questions: current.questions.filter(
        (question) => question.id !== questionId,
      ),
    }));
  };

  const addOption = (qId: string) => {
    setFormState((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.id !== qId) {
          return question;
        }

        return {
          ...question,
          options: [
            ...question.options,
            `Option ${question.options.length + 1}`,
          ],
        };
      }),
    }));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setFormState((current) => ({
      ...current,
      questions: current.questions.map((question) => {
        if (question.id !== qId) {
          return question;
        }

        const nextOptions = [...question.options];
        nextOptions[index] = value;

        return {
          ...question,
          options: nextOptions,
        };
      }),
    }));
  };

  const removeOption = (qId: string, index: number) => {
    setFormState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === qId
          ? {
              ...question,
              options: question.options.filter(
                (_, optionIndex) => optionIndex !== index,
              ),
            }
          : question,
      ),
    }));
  };

  const handleSubmit = async () => {
    const validationError = validateSurveyForm(formState);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const surveyData: SurveyUpsertPayload = {
      title: sanitizeText(formState.title),
      description: sanitizeText(formState.description),
      expiry_date: formState.expiryDate,
      questions: formState.questions.map((q) => ({
        ...q,
        text: sanitizeText(q.text),
        options: q.options.map(sanitizeText),
      })),
      settings: {
        ...formState.settings,
        thank_you_message: sanitizeText(formState.settings.thank_you_message),
      },
    };

    const { error: serviceError } = isEdit
      ? await surveyService.update(id!, surveyData)
      : await surveyService.create(surveyData);

    if (serviceError) {
      setError(serviceError);
      setIsSubmitting(false);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading)
    return <div className="text-center py-20">Loading survey data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Survey" : "Create New Survey"}
        </h1>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isPublishedSurvey}
          className="px-8 flex gap-2"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <CheckCircle2 size={20} />
              {isEdit ? "Update Survey" : "Save Survey"}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <SurveyBasicsCard
        title={formState.title}
        description={formState.description}
        expiryDate={formState.expiryDate}
        onTitleChange={(value) =>
          setFormState((current) => ({ ...current, title: value }))
        }
        onDescriptionChange={(value) =>
          setFormState((current) => ({ ...current, description: value }))
        }
        onExpiryDateChange={(value) =>
          setFormState((current) => ({ ...current, expiryDate: value }))
        }
      />

      <SurveySettingsCard
        settings={formState.settings}
        onAnonymousChange={(value) =>
          setFormState((current) => ({
            ...current,
            settings: { ...current.settings, is_anonymous: value },
          }))
        }
        onDisplayOrderChange={(value) =>
          setFormState((current) => ({
            ...current,
            settings: { ...current.settings, display_order: value },
          }))
        }
        onThankYouMessageChange={(value) =>
          setFormState((current) => ({
            ...current,
            settings: { ...current.settings, thank_you_message: value },
          }))
        }
      />

      <div className="space-y-6">
        <Reorder.Group
          axis="y"
          values={formState.questions}
          onReorder={(nextQuestions) =>
            setFormState((current) => ({
              ...current,
              questions: nextQuestions,
            }))
          }
          className="space-y-6"
        >
          {formState.questions.map((question) => (
            <Reorder.Item key={question.id} value={question}>
              <QuestionEditorCard
                question={question}
                onQuestionChange={updateQuestion}
                onRemoveQuestion={removeQuestion}
                onAddOption={addOption}
                onUpdateOption={updateOption}
                onRemoveOption={removeOption}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <QuestionTypeActions onAddQuestion={addQuestion} />
      </div>
    </div>
  );
}
