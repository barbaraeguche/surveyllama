

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow text-left">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}
