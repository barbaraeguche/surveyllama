import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components/UI";
import {
  Plus,
  BarChart3,
  ExternalLink,
  Trash2,
  Send,
  AlertCircle,
  Edit,
  PowerOff,
  Mail,
} from "lucide-react";
import { Survey } from "../types";
import { surveyService } from "../services/surveyService";
import { useAuth } from "../contexts/AuthContext";
import { AnimatePresence, motion } from "motion/react";
import { LoadingSpinner } from "../components/LoadingState";
import { Banner } from "../components/Banner";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    surveyId: string | null;
    surveyTitle: string;
  }>({
    isOpen: false,
    surveyId: null,
    surveyTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await surveyService.getAll();

    if (error) {
      setError(error);
    } else if (data) {
      setSurveys(data);
    }
    setLoading(false);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, surveyId: id, surveyTitle: title });
  };

  const confirmDelete = async () => {
    if (!deleteModal.surveyId) return;

    setIsDeleting(true);
    const { error } = await surveyService.delete(deleteModal.surveyId);

    if (error) {
      setError(error);
    } else {
      setSurveys(surveys.filter((s) => s.id !== deleteModal.surveyId));
    }
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, surveyId: null, surveyTitle: "" });
  };

  const handlePublish = async (id: string) => {
    const { error } = await surveyService.publish(id);

    if (error) {
      setError(error);
    } else {
      fetchSurveys();
    }
  };

  const handleUnpublish = async (id: string) => {
    const { error } = await surveyService.unpublish(id);

    if (error) {
      setError(error);
    } else {
      fetchSurveys();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Welcome back,{" "}
            {user?.displayName || user?.email?.split("@")[0] || "Admin"}!
          </h1>
          <p className="text-neutral-500 mt-1 text-sm sm:text-base">
            Manage your surveys and view analytics.
          </p>
        </div>

        <Link to="/create" className="shrink-0">
          <Button className="w-full sm:w-auto flex gap-2">
            <Plus size={20} />
            Create New Survey
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {error && (
          <Banner
            message={error}
            onClose={() => setError("")}
            className="mb-8"
          />
        )}
      </AnimatePresence>

      {surveys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center">
            <p className="text-neutral-500 mb-4">
              You haven't created any surveys yet.
            </p>
            <Link to="/create">
              <Button variant="outline">Create your first survey</Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6"
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
          {surveys.map((survey) => (
            <motion.div
              key={survey.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-5 sm:p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg sm:text-xl font-bold line-clamp-1 pr-2">
                    {survey.title}
                  </h3>
                  <Badge color={survey.is_published ? "green" : "yellow"}>
                    {survey.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <p className="text-neutral-600 text-sm mb-6 line-clamp-2 grow">
                  {survey.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {survey.is_published ? (
                    <Link to={`/invite/${survey.id}`} className="flex-1">
                      <Button
                        size="md"
                        className="w-full flex gap-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 border-none"
                      >
                        <Mail size={16} />
                        Invite
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="md"
                      className="flex-1 w-full flex gap-1.5 bg-purple-50 text-purple-600 border-none cursor-not-allowed hover:bg-purple-100"
                      title="Publish this survey before sending invitations"
                    >
                      <Mail size={16} />
                      Invite
                    </Button>
                  )}

                  <Link to={`/analytics/${survey.id}`} className="flex-1">
                    <Button
                      size="md"
                      className="w-full flex gap-1.5 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border-none"
                    >
                      <BarChart3 size={16} />
                      Stats
                    </Button>
                  </Link>

                  {survey.is_published ? (
                    <>
                      <Link
                        to={`/survey/${survey.id}`}
                        target="_blank"
                        className="flex-1"
                      >
                        <Button
                          size="md"
                          className="w-full flex gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none"
                        >
                          <ExternalLink size={16} />
                          View
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleUnpublish(survey.id)}
                        size="md"
                        className="w-full flex-1 flex gap-1.5 bg-orange-100 text-stone-700 hover:bg-orange-200 border-none"
                        title="Unpublish to edit"
                      >
                        <PowerOff size={16} />
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to={`/edit/${survey.id}`} className="flex-1">
                        <Button
                          size="md"
                          className="w-full flex gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"
                        >
                          <Edit size={16} />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handlePublish(survey.id)}
                        className="w-full flex-1 flex gap-1.5 bg-green-600 hover:bg-green-700 border-none"
                      >
                        <Send size={16} />
                        Publish
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => handleDeleteClick(survey.id, survey.title)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 px-3 border-none py-1.5"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Survey"
        message={`Are you sure you want to delete "${deleteModal.surveyTitle}"? This action cannot be undone and all response data will be lost.`}
        confirmText="Delete"
        type="danger"
        isSubmitting={isDeleting}
      />
    </div>
  );
}
