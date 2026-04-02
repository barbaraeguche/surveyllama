import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { ClipboardList, BarChart3, ShieldCheck, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl mb-6">
          Gather Insights with <span className="text-indigo-600">Confidence</span>
        </h1>
        <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
          Create professional surveys in minutes, distribute them securely, and analyze results with powerful real-time tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button className="px-8 py-6 text-lg rounded-xl">Get Started</Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
        <FeatureCard
          icon={<ClipboardList className="text-indigo-600" size={32} />}
          title="Intuitive Builder"
          description="Build complex surveys with multiple question types including rating scales and multiple choice."
        />
        <FeatureCard
          icon={<Send className="text-indigo-600" size={32} />}
          title="Easy Distribution"
          description="Share your surveys via secure links or email invitations to your participants."
        />
        <FeatureCard
          icon={<BarChart3 className="text-indigo-600" size={32} />}
          title="Real-time Analytics"
          description="Visualize your data immediately with interactive charts and detailed response breakdowns."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow text-left">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}
