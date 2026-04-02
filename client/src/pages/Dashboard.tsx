import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/UI';
import { Plus, BarChart3, ExternalLink, Trash2, Send, AlertCircle, Edit, PowerOff, Mail } from 'lucide-react';
import { Survey } from '../types';
import { surveyService } from '../services/surveyService';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    const { error } = await surveyService.delete(id);
    
    if (error) {
      alert(error);
    } else {
      setSurveys(surveys.filter(s => s.id !== id));
    }
  };

  const handlePublish = async (id: string) => {
    const { error } = await surveyService.publish(id);
    
    if (error) {
      alert(error);
    } else {
      fetchSurveys();
    }
  };

  const handleUnpublish = async (id: string) => {
    const { error } = await surveyService.unpublish(id);
    
    if (error) {
      alert(error);
    } else {
      fetchSurveys();
    }
  };

  if (loading) return <div className="text-center py-20">Loading surveys...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Admin'}!
        </h1>
        <p className="text-neutral-500 mt-1">Manage your surveys and view analytics.</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-neutral-800">Your Surveys</h2>
        <div className="flex gap-2">
          <Link to="/create">
            <Button className="flex gap-2">
              <Plus size={20} />
              Create New Survey
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
          <button onClick={fetchSurveys} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}

      {surveys.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-neutral-500 mb-4">You haven't created any surveys yet.</p>
          <Link to="/create">
            <Button variant="outline">Create your first survey</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold line-clamp-1">{survey.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  survey.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {survey.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <p className="text-neutral-600 text-sm mb-6 line-clamp-2 grow">
                {survey.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                <Link to={`/invite/${survey.id}`} className="flex-1">
                  <Button className="w-full flex gap-1 bg-purple-50 text-purple-600 hover:bg-purple-100">
                    <Mail size={16} />
                    Invite
                  </Button>
                </Link>

                <Link to={`/analytics/${survey.id}`} className="flex-1">
                  <Button className="w-full flex gap-1 bg-neutral-100 text-neutral-900 hover:bg-neutral-200">
                    <BarChart3 size={16} />
                    Stats
                  </Button>
                </Link>
                
                {survey.is_published ? (
                  <>
                    <Link to={`/survey/${survey.id}`} target="_blank" className="flex-1">
                      <Button className="w-full flex gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                        <ExternalLink size={16} />
                        View
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleUnpublish(survey.id)}
                      className="flex-1 flex gap-1 bg-orange-50 text-orange-600 hover:bg-orange-100"
                      title="Unpublish to edit"
                    >
                      <PowerOff size={16} />
                      Unpublish
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to={`/edit/${survey.id}`} className="flex-1">
                      <Button className="w-full flex gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <Edit size={16} />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handlePublish(survey.id)}
                      className="flex-1 flex gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Send size={16} />
                      Publish
                    </Button>
                  </>
                )}

                <Button 
                  onClick={() => handleDelete(survey.id)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
