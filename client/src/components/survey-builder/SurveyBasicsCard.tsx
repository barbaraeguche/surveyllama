import { Card, Input } from "../UI";

type SurveyBasicsCardProps = {
  title: string;
  description: string;
  expiryDate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
};

export default function SurveyBasicsCard({
  title,
  description,
  expiryDate,
  onTitleChange,
  onDescriptionChange,
  onExpiryDateChange,
}: SurveyBasicsCardProps) {
  return (
    <Card className="p-8 mb-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Survey Title
        </label>
        <Input
          placeholder="e.g., Customer Satisfaction 2024"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="text-xl font-bold"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          rows={3}
          placeholder="Tell your participants what this survey is about..."
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Expiry Date (Optional)
        </label>
        <Input
          type="date"
          value={expiryDate}
          onChange={(event) => onExpiryDateChange(event.target.value)}
        />
      </div>
    </Card>
  );
}
