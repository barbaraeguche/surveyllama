import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import FeatureCard from "../components/featureCard";
import {
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Send,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/authContext";

export default function Home() {
  const { user, token } = useAuth();
  return (
    <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl mb-6">
          {token ? (
            <>
              Welcome back,{" "}
              <span className="text-indigo-600">
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
            </>
          ) : (
            <>
              Gather Insights with{" "}
              <span className="text-indigo-600">Confidence</span>
            </>
          )}
        </h1>
        <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
          {token
            ? "Ready to create your next survey? Check your dashboard for recent activity and insights."
            : "Create professional surveys in minutes, distribute them securely, and analyze results with powerful real-time tools."}
        </p>
        <div className="flex gap-4 justify-center">
          {token ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button className="px-8 py-6 text-lg shadow-sm hover:shadow-md transition-shadow rounded-xl flex gap-2">
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/create">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  Create New Survey
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/login">
              <Button className="px-8 py-6 text-lg rounded-xl">
                Get Started
              </Button>
            </Link>
          )}
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

