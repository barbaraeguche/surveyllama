import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Input } from "../components/UI";
import {
  Upload,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  X,
  Paperclip,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import { surveyService } from "../services/surveyService";
import { Survey } from "../types";
import { LoadingSpinner } from "../components/LoadingState";
import { Banner } from "../components/Banner";

type StatusState = { type: "success" | "error"; message: string } | null;

type UploadDebugState = {
  attemptedPath?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  serverResponse?: string;
} | null;

export default function SendInvitations() {
  const { id } = useParams<{ id: string }>();
  const { user, token, loading: authLoading } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<
    { filename: string; path: string }[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [status, setStatus] = useState<StatusState>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isSurveyLoading, setIsSurveyLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) {
        setStatus({ type: "error", message: "Survey ID is missing." });
        setIsSurveyLoading(false);
        return;
      }

      setIsSurveyLoading(true);

      const { data, error } = await surveyService.getById(id);

      if (error) {
        setStatus({ type: "error", message: error });
        setSurvey(null);
      } else {
        setSurvey(data ?? null);
      }

      setIsSurveyLoading(false);
    };

    void loadSurvey();
  }, [id]);

  const processEmails = (text: string) => {
    // Split by comma, newline, or semicolon and filter valid emails
    const emailList = text
      .split(/[,\n;]/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    setEmails((prev) => Array.from(new Set([...prev, ...emailList])));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processEmails(text);
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileAttachment = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!id) {
      setStatus({ type: "error", message: "Survey ID is missing." });
      return;
    }

    if (!user?.uid) {
      setStatus({
        type: "error",
        message: "You must be signed in to upload attachments.",
      });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const filePath = `attachments/${user.uid}/${id}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setAttachments((prev) => [
        ...prev,
        { filename: file.name, path: downloadURL },
      ]);
    } catch (err) {
      console.error("Error uploading file:", err);
      setStatus({ type: "error", message: "Failed to upload attachment." });
    } finally {
      setIsUploading(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "text/plain" ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".txt"))
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processEmails(text);
      };
      reader.readAsText(file);
    }
  };

  const addManualEmail = () => {
    if (manualEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
      setEmails((prev) => Array.from(new Set([...prev, manualEmail])));
      setManualEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSend = async () => {
    if (emails.length === 0 || !survey?.is_published) return;

    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/surveys/send-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          surveyId: id,
          emails: emails,
          surveyUrl: `${window.location.origin}/survey/${id}`,
          attachments: attachments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: `Successfully sent ${emails.length} invitations!`,
        });
        setEmails([]);
        setAttachments([]);
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to send invitations.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: "An error occurred while sending invitations.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isSurveyLoading) {
    return <LoadingSpinner />;
  }

  if (!survey) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors duration-200 ease-out"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <Card className="p-8">
            <div className="overflow-hidden rounded-lg border-l-4 border-red-400 bg-red-50 p-4 ring-1 ring-inset ring-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <div>
                  <h1 className="text-base font-semibold text-red-900">
                    Survey unavailable
                  </h1>
                  <p className="mt-1 text-sm text-red-800">
                    {status?.message ||
                      "We couldn't load this survey right now. Return to the dashboard and try again."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!survey.is_published) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors duration-200 ease-out"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <Card className="p-8">
            <div className="overflow-hidden rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 ring-1 ring-inset ring-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-amber-900">
                    Publish this survey before sending invitations
                  </h1>
                  <p className="mt-1 text-sm text-amber-800">
                    {`"${survey.title}"`} is still in draft mode. Publish it
                    from the dashboard to unlock email invitations, then come
                    back here to send them.
                  </p>
                  {status && status.type === "error" && (
                    <p className="mt-3 text-sm text-red-700">
                      {status.message}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to="/dashboard">
                      <Button className="transition-all duration-200 ease-out">
                        Back to Dashboard
                      </Button>
                    </Link>
                    <p className="self-center text-sm text-amber-700">
                      After publishing, the invite form will be available
                      immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-indigo-600" />
              Upload Participant Emails
            </h2>
            <p className="text-neutral-600 text-sm mb-6">
              Upload a .csv or .txt file containing email addresses, or paste
              them below.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.txt"
                className="hidden"
              />
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                  isDragging
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-neutral-100 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
              >
                <Upload size={24} />
              </div>
              <p className="font-medium text-neutral-900">
                {isDragging
                  ? "Drop file here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                CSV or TXT files only
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Add emails manually
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="email@example.com"
                  value={manualEmail}
                  className="flex-1"
                  onChange={(e) => setManualEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addManualEmail();
                    }
                  }}
                />
                <Button
                  variant="primary"
                  onClick={addManualEmail}
                  className="whitespace-nowrap shrink-0"
                  disabled={
                    !manualEmail ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)
                  }
                >
                  Add Email
                </Button>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail size={20} className="text-indigo-600" />
                Recipient List ({emails.length})
              </h2>
              {emails.length > 0 && (
                <button
                  onClick={() => setEmails([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {emails.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 border border-dashed border-neutral-100 rounded-lg">
                No recipients added yet.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-neutral-50 p-2 rounded-lg border border-neutral-100"
                  >
                    <span className="text-sm text-neutral-700">{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Paperclip size={20} className="text-indigo-600" />
                Attachments
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex gap-2"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={isUploading || authLoading || !user?.uid}
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Attach File
              </Button>
              <input
                type="file"
                ref={attachmentInputRef}
                onChange={handleFileAttachment}
                className="hidden"
              />
            </div>

            {attachments.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 border border-dashed border-neutral-100 rounded-lg ">
                No files attached.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText
                        size={16}
                        className="text-neutral-400 shrink-0"
                      />
                      <span className="text-sm text-neutral-700 truncate">
                        {file.filename}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-center">
              Send Invitations
            </h2>

            <div className="space-y-4">
              {/* <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Survey Link
                </label>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono break-all text-neutral-600">
                  {window.location.origin}/survey/{id}
                </div>
              </div> */}

              <div className="pt-4">
                <Button
                  onClick={handleSend}
                  disabled={emails.length === 0 || isSending}
                  className="w-full flex items-center justify-center gap-2 py-6"
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Mail size={18} />
                      Send to {emails.length} People
                    </>
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {status && (
                  <Banner
                    message={status.message}
                    type={status.type}
                    onClose={() => setStatus(null)}
                    className="mt-6"
                  />
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
