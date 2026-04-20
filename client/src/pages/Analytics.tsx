import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckSquare,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react";

import StatCard from "../components/StatCard";
import AnalyticsQuestionCard from "../components/analytics/AnalyticsQuestionCard";
import ResponseTrendsCard from "../components/analytics/ResponseTrendsCard";
import { surveyService } from "../services/surveyService";
import { AnalyticsDateRange, AnalyticsTrend, SurveyAnalytics } from "../types";
import { motion } from "motion/react";
import { LoadingSpinner } from "../components/LoadingState";
import { ErrorState } from '../components/ErrorState';
import { Badge } from '../components/Badge';

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

  // --- StatCard metrics ---
  // Completion Rate: % of responses that answered all required questions
  let completionRate = "N/A";
  let avgAnswers = "N/A";
  let mostActiveDay = "N/A";

  if (analytics) {
    const requiredQuestions = analytics.questions.filter((q) => q.required);
    const totalResponses = analytics.totalResponses;
    // For each response, count how many required questions are answered
    // Assume: analytics.questions[0].data.length === totalResponses
    // Build a map: responseIndex -> count of required questions answered
    const responseCount = totalResponses;
    if (responseCount > 0 && requiredQuestions.length > 0) {
      // For each response index, check if all required questions have a value
      let completeCount = 0;
      for (let i = 0; i < responseCount; i++) {
        let allAnswered = true;
        for (const q of requiredQuestions) {
          const ans = q.data[i];
          if (
            ans === undefined ||
            ans === null ||
            (typeof ans === "string" && ans.trim() === "") ||
            (Array.isArray(ans) && ans.length === 0)
          ) {
            allAnswered = false;
            break;
          }
        }
        if (allAnswered) completeCount++;
      }
      completionRate = `${Math.round((completeCount / responseCount) * 100)}%`;
    } else if (responseCount > 0) {
      completionRate = "100%";
    }

    // Average answers per respondent
    if (responseCount > 0) {
      let totalAnswers = 0;
      for (let i = 0; i < responseCount; i++) {
        let answersForThisResponse = 0;
        for (const q of analytics.questions) {
          const val = q.data[i];
          if (
            val !== undefined &&
            val !== null &&
            ((typeof val === "string" && val.trim() !== "") ||
              typeof val === "number" ||
              (Array.isArray(val) && val.length > 0))
          ) {
            answersForThisResponse++;
          }
        }
        totalAnswers += answersForThisResponse;
      }
      avgAnswers = (totalAnswers / responseCount).toFixed(1);
    }

    // Most active day
    if (analytics.trends && analytics.trends.length > 0) {
      const max = analytics.trends.reduce((a, b) =>
        a.count > b.count ? a : b,
      );
      mostActiveDay = `${max.date} (${max.count})`;
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!analytics) return <ErrorState message="Could not load analytics data. Please try again later."/>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 sm:px-6">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="grow">
          <div className="flex items-center gap-3 mb-2">

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            {analytics.survey.title}
          </h1>
          <Badge color={analytics.survey.is_published ? "green" : "yellow"}  className="mt-1">
            {analytics.survey.is_published ? "Published" : "Draft"}
          </Badge>

          </div>
          <p className="text-neutral-500 max-w-2xl text-sm sm:text-base">
            {analytics.survey.description}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold self-start lg:self-end shrink-0">
          <Users size={16} />
          {analytics.totalResponses} Total Responses
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatCard
            label="Completion Rate"
            value={completionRate}
            icon={<CheckSquare className="text-emerald-500" />}
            sub="% of responses answering all required questions"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatCard
            label="Avg. Answers/Respondent"
            value={avgAnswers}
            icon={<Users className="text-amber-500" />}
            sub="Average number of questions answered"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <StatCard
            label="Most Active Day"
            value={mostActiveDay}
            icon={<Calendar className="text-indigo-500" />}
            sub="Day with most responses (count)"
          />
        </motion.div>
      </motion.div>

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
