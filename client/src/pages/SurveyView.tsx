import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { Survey, Question } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { surveyService } from '../services/surveyService';

export default function SurveyView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  useEffect(() => {
    if (survey && survey.questions) {
      let qs = [...survey.questions];
      if (survey.settings?.display_order === 'random') {
        qs = qs.sort(() => Math.random() - 0.5);
      }
      setDisplayQuestions(qs);
    }
  }, [survey]);

  const fetchSurvey = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { data, error } = await surveyService.getById(id);
    
    if (error) {
      setError(error);
    } else if (data) {
      setSurvey(data);
    }
    setLoading(false);
  };

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const missingRequired = survey?.questions?.filter(q => q.required && !answers[q.id]);
    if (missingRequired && missingRequired.length > 0) {
      return alert('Please answer all required questions.');
    }

    setIsSubmitting(true);
    setError(null);

    const { error } = await surveyService.submitResponse(id!, { email, answers, token });

    if (error) {
      setError(error);
      setIsSubmitting(false);
    } else {
      setSubmitted(true);
    }
  };

  if (loading) return <div className="text-center py-20">Loading survey...</div>;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <Card className="p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={fetchSurvey}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!survey) return <div className="text-center py-20">Survey not found.</div>;
  if (!survey.is_published) return <div className="text-center py-20">This survey is not yet published.</div>;

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="p-12">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-neutral-600">
              {survey.settings?.thank_you_message || 'Your responses have been successfully submitted. We appreciate your feedback.'}
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">{survey.title}</h1>
        {survey.description && <p className="text-neutral-600 text-lg">{survey.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!survey.settings?.is_anonymous && (
          <Card className="p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Email (Optional)</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Card>
        )}

        {displayQuestions.map((q, idx) => (
          <Card key={q.id} className="p-6">
            <div className="flex items-start gap-2 mb-6">
              <span className="text-neutral-400 font-mono mt-1">{idx + 1}.</span>
              <h3 className="text-xl font-medium">
                {q.text}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            </div>

            <div className="space-y-3">
              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                        required={q.required}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'checkbox' && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={(answers[q.id] || []).includes(opt)}
                        onChange={(e) => {
                          const current = answers[q.id] || [];
                          if (e.target.checked) {
                            handleAnswerChange(q.id, [...current, opt]);
                          } else {
                            handleAnswerChange(q.id, current.filter((v: string) => v !== opt));
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <textarea
                  className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  required={q.required}
                />
              )}

              {q.type === 'rating' && (
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, n)}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${
                        answers[q.id] === n
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-neutral-100 hover:border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Button type="submit" className="w-full py-6 text-xl rounded-xl shadow-lg shadow-indigo-200">
          Submit Survey
        </Button>
      </form>
    </div>
  );
}
