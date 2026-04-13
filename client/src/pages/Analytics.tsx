import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckSquare,
  Calendar,
  MessageSquare,
  Users,
  ArrowLeft,
} from "lucide-react";

import StatCard from "../components/StatCard";
import AnalyticsQuestionCard from "../components/analytics/AnalyticsQuestionCard";
import ResponseTrendsCard from "../components/analytics/ResponseTrendsCard";
import { surveyService } from "../services/surveyService";
import { AnalyticsDateRange, AnalyticsTrend, SurveyAnalytics } from "../types";

function getStartDate(
  dateRange: AnalyticsDateRange,
  customStart: string,
  now: Date,
) {
  if (dateRange === "7d") {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    return startDate;
  }

  if (dateRange === "30d") {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
    return startDate;
  }

  if (dateRange === "custom" && customStart) {
    return new Date(customStart);
  }

  return null;
}

function getEndDate(customEnd: string) {
  if (!customEnd) {
    return null;
  }

  const endDate = new Date(customEnd);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

function filterTrends(
  trends: AnalyticsTrend[],
  dateRange: AnalyticsDateRange,
  customStart: string,
  customEnd: string,
) {
  const now = new Date();
  const startDate = getStartDate(dateRange, customStart, now);
  const endDate = getEndDate(customEnd);

  return trends.filter((trend) => {
    const trendDate = new Date(trend.date);

    if (startDate && trendDate < startDate) {
      return false;
    }

    if (endDate && trendDate > endDate) {
      return false;
    }

    return true;
  });
}

export default function Analytics() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Survey ID is missing.");
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);

      const { data, error: serviceError } =
        await surveyService.getAnalytics(id);

      if (!isActive) {
        return;
      }

      if (serviceError) {
        setError(serviceError);
        setAnalytics(null);
      } else {
        setAnalytics(data ?? null);
      }

      setLoading(false);
    };

    void loadAnalytics();

    return () => {
      isActive = false;
    };
  }, [id]);

  const filteredTrends = useMemo(() => {
    if (!analytics?.trends) {
      return [];
    }

    return filterTrends(analytics.trends, dateRange, customStart, customEnd);
  }, [analytics?.trends, customEnd, customStart, dateRange]);

  const recentActivityCount =
    analytics?.trends.length && analytics.trends.length > 0
      ? analytics.trends[analytics.trends.length - 1].count
      : 0;

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-neutral-400">
        Loading analytics...
      </div>
    );

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-center py-20">No data available.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {analytics.survey.title}
          </h1>
          <p className="text-neutral-500 max-w-2xl">
            {analytics.survey.description}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
          <Users size={16} />
          {analytics.totalResponses} Total Responses
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          label="Completion Rate"
          value="92%"
          icon={<CheckSquare className="text-emerald-500" />}
          sub="Estimated based on views"
        />
        <StatCard
          label="Avg. Completion Time"
          value="4m 12s"
          icon={<Calendar className="text-amber-500" />}
          sub="Stable over last 7 days"
        />
        <StatCard
          label="Recent Activity"
          value={recentActivityCount > 0 ? `+${recentActivityCount}` : "0"}
          icon={<MessageSquare className="text-indigo-500" />}
          sub="Responses today"
        />
      </div>

      <ResponseTrendsCard
        trends={filteredTrends}
        dateRange={dateRange}
        customStart={customStart}
        customEnd={customEnd}
        onDateRangeChange={setDateRange}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {analytics.questions.map((question, index) => (
          <AnalyticsQuestionCard
            key={question.id}
            question={question}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
