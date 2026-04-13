import { Card } from "./UI";

export default function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-neutral-50 rounded-lg">{icon}</div>
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-neutral-500 italic">{sub}</div>
    </Card>
  );
}
