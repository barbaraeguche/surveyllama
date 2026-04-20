import { Card } from "../UI";
import { QuestionDisplayOrder, SurveySettings } from "../../types";

type SurveySettingsCardProps = {
  settings: SurveySettings;
  onAnonymousChange: (value: boolean) => void;
  onDisplayOrderChange: (value: QuestionDisplayOrder) => void;
  onThankYouMessageChange: (value: string) => void;
};

export default function SurveySettingsCard({
  settings,
  onAnonymousChange,
  onDisplayOrderChange,
  onThankYouMessageChange,
}: SurveySettingsCardProps) {
  return (
    <Card className="p-6 sm:p-8 mb-8">
      <h2 className="text-xl font-bold mb-6">Survey Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-anonymous"
                checked={settings.is_anonymous}
                onChange={(event) => onAnonymousChange(event.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="is-anonymous"
                className="text-sm font-medium text-neutral-700"
              >
                Anonymous Responses
              </label>
            </div>
            <p className="text-xs text-neutral-500 mt-1 ml-7">
              Participant emails will not be collected.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question Display Order
            </label>
            <select
              value={settings.display_order}
              onChange={(event) =>
                onDisplayOrderChange(event.target.value as QuestionDisplayOrder)
              }
              className="w-full rounded-md border border-neutral-200 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="sequential">Sequential (Default)</option>
              <option value="random">Randomize Order</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Custom Thank You Message
          </label>
          <textarea
            className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={4}
            placeholder="Message shown after submission..."
            value={settings.thank_you_message}
            onChange={(event) => onThankYouMessageChange(event.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
