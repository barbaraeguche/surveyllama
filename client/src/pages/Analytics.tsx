import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { surveyService } from '../services/surveyService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data, error } = await surveyService.getAnalytics(id!);
    
    if (error) {
      console.error(error);
    } else if (data) {
      setData(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20">Loading analytics...</div>;
  if (!data) return <div className="text-center py-20">No data available.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Survey Analytics</h1>
        <p className="text-neutral-500">Total Responses: <span className="font-bold text-indigo-600">{data.totalResponses}</span></p>
      </div>

      <div className="space-y-10">
        {data.questions.map((q: any, idx: number) => (
          <Card key={q.id} className="p-8">
            <h3 className="text-xl font-bold mb-6 flex gap-3">
              <span className="text-neutral-300 font-mono">{idx + 1}.</span>
              {q.text}
            </h3>

            <div className="h-[300px] w-full">
              {(q.type === 'multiple_choice' || q.type === 'rating') && (
                <BarChartComponent data={q.data} />
              )}
              {q.type === 'checkbox' && (
                <CheckboxChartComponent data={q.data} />
              )}
              {q.type === 'short_answer' && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-4">
                  {q.data.map((ans: string, i: number) => (
                    <div key={i} className="p-3 bg-neutral-50 rounded-lg text-sm border border-neutral-100 italic">
                      "{ans}"
                    </div>
                  ))}
                  {q.data.length === 0 && <p className="text-neutral-400 italic">No responses yet.</p>}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BarChartComponent({ data }: { data: any[] }) {
  const counts: Record<string, number> = {};
  data.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CheckboxChartComponent({ data }: { data: any[][] }) {
  const counts: Record<string, number> = {};
  data.flat().forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
