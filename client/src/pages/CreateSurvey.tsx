import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { Plus, Trash2, GripVertical, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Question, QuestionType } from '../types';
import { motion, Reorder } from 'motion/react';
import { surveyService } from '../services/surveyService';

export default function CreateSurvey() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<'sequential' | 'random'>('sequential');
  const [thankYouMessage, setThankYouMessage] = useState('Thank you for participating in our survey!');
  const [questions, setQuestions] = useState<Partial<Question>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    setLoading(true);
    const { data, error } = await surveyService.getById(id!);
    if (error) {
      setError(error);
    } else if (data) {
      setTitle(data.title);
      setDescription(data.description || '');
      setExpiryDate(data.expiry_date || '');
      setIsAnonymous(data.settings?.is_anonymous || false);
      setDisplayOrder(data.settings?.display_order || 'sequential');
      setThankYouMessage(data.settings?.thank_you_message || 'Thank you for participating in our survey!');
      setQuestions(data.questions || []);
      
      if (data.is_published) {
        setError('This survey is currently published and cannot be edited. Please unpublish it first.');
      }
    }
    setLoading(false);
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Partial<Question> = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      options: type === 'multiple_choice' || type === 'checkbox' ? ['Option 1'] : [],
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (qId: string) => {
    const q = questions.find(q => q.id === qId);
    if (q) {
      updateQuestion(qId, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] });
    }
  };

  const updateOption = (qId: string, index: number, value: string) => {
    const q = questions.find(q => q.id === qId);
    if (q && q.options) {
      const newOptions = [...q.options];
      newOptions[index] = value;
      updateQuestion(qId, { options: newOptions });
    }
  };

  const removeOption = (qId: string, index: number) => {
    const q = questions.find(q => q.id === qId);
    if (q && q.options) {
      updateQuestion(qId, { options: q.options.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!title) return alert('Please enter a survey title');
    if (questions.length === 0) return alert('Please add at least one question');

    setIsSubmitting(true);
    setError(null);

    const surveyData = {
      title,
      description,
      expiry_date: expiryDate,
      questions,
      settings: {
        is_anonymous: isAnonymous,
        display_order: displayOrder,
        thank_you_message: thankYouMessage
      }
    };

    const { data, error } = isEdit 
      ? await surveyService.update(id!, surveyData)
      : await surveyService.create(surveyData);

    if (error) {
      setError(error);
      setIsSubmitting(false);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="text-center py-20">Loading survey data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/dashboard" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Survey' : 'Create New Survey'}</h1>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || (isEdit && error?.includes('published'))} 
          className="px-8 flex gap-2"
        >
          {isSubmitting ? 'Saving...' : (
            <>
              <CheckCircle2 size={20} />
              {isEdit ? 'Update Survey' : 'Save Survey'}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <Card className="p-8 mb-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Survey Title</label>
          <Input
            placeholder="e.g., Customer Satisfaction 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
          <textarea
            className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            placeholder="Tell your participants what this survey is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date (Optional)</label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="text-xl font-bold mb-6">Survey Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is-anonymous" className="text-sm font-medium text-neutral-700">
                Anonymous Responses
                <p className="text-xs text-neutral-500 font-normal">Participant emails will not be collected.</p>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Question Display Order</label>
              <select
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value as 'sequential' | 'random')}
                className="w-full rounded-md border border-neutral-200 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="sequential">Sequential (Default)</option>
                <option value="random">Randomize Order</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Custom Thank You Message</label>
            <textarea
              className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={4}
              placeholder="Message shown after submission..."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Reorder.Group axis="y" values={questions} onReorder={setQuestions} className="space-y-6">
          {questions.map((q) => (
            <Reorder.Item key={q.id} value={q}>
              <Card className="p-6 relative group">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={24} />
                </div>
                
                <div className="flex justify-between items-start mb-4 ml-6">
                  <div className="flex-grow mr-4">
                    <Input
                      placeholder="Enter your question here..."
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id!, { text: e.target.value })}
                      className="font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                      {q.type?.replace('_', ' ')}
                    </span>
                    <button onClick={() => removeQuestion(q.id!)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="ml-6 space-y-4">
                  {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                    <div className="space-y-2">
                      {q.options?.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className={`w-4 h-4 border border-neutral-300 ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`} />
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(q.id!, idx, e.target.value)}
                            className="h-8 text-sm"
                          />
                          <button onClick={() => removeOption(q.id!, idx)} className="text-neutral-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <Button onClick={() => addOption(q.id!)} className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 text-xs py-1 h-auto">
                        + Add Option
                      </Button>
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div className="flex gap-2 text-neutral-400">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-xs">
                          {n}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="border-b border-dashed border-neutral-300 py-2 text-neutral-400 text-sm">
                      Participant will type their answer here...
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-neutral-50">
                    <input
                      type="checkbox"
                      id={`req-${q.id}`}
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id!, { required: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`req-${q.id}`} className="text-xs text-neutral-500">Required question</label>
                  </div>
                </div>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <div className="flex flex-wrap gap-3 justify-center pt-8">
          <Button onClick={() => addQuestion('multiple_choice')} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
            + Multiple Choice
          </Button>
          <Button onClick={() => addQuestion('checkbox')} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
            + Checkbox
          </Button>
          <Button onClick={() => addQuestion('short_answer')} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
            + Short Answer
          </Button>
          <Button onClick={() => addQuestion('rating')} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
            + Rating Scale
          </Button>
        </div>
      </div>
    </div>
  );
}
