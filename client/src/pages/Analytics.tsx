import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/UI';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend 
} from 'recharts';
import { surveyService } from '../services/surveyService';
import { Users, Calendar, CheckSquare, MessageSquare } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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

  if (loading) return <div className="text-center py-20 animate-pulse text-neutral-400">Loading analytics...</div>;
  if (!data) return <div className="text-center py-20">No data available.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{data.survey.title}</h1>
          <p className="text-neutral-500 max-w-2xl">{data.survey.description}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
          <Users size={16} />
          {data.totalResponses} Total Responses
        </div>
      </div>

      {/* Summary Stats */}
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
          value={data.trends.length > 0 ? `+${data.trends[data.trends.length-1].count}` : '0'} 
          icon={<MessageSquare className="text-indigo-500" />} 
          sub="Responses today"
        />
      </div>

      {/* Trends Chart */}
      {data.trends.length > 0 && (
        <Card className="p-8 mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Response Trends</h2>
            <p className="text-sm text-neutral-500 text-italic">Daily response volume over time</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.questions.map((q: any, idx: number) => (
          <Card key={q.id} className="p-8 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Question {idx + 1}</span>
                <span className="text-xs text-neutral-400">• {q.type.replace('_', ' ')}</span>
              </div>
              <h3 className="text-lg font-bold leading-tight">
                {q.text}
              </h3>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
              {(q.type === 'multiple_choice' || q.type === 'rating') && (
                <BarChartComponent data={q.data} options={q.options} />
              )}
              {q.type === 'checkbox' && (
                <CheckboxChartComponent data={q.data} />
              )}
              {q.type === 'short_answer' && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {q.data.map((ans: string, i: number) => (
                    <div key={i} className="p-4 bg-neutral-50 rounded-xl text-sm border border-neutral-100 leading-relaxed">
                      "{ans}"
                    </div>
                  ))}
                  {q.data.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-10">
                      <MessageSquare size={32} className="mb-2 opacity-20" />
                      <p className="italic text-sm">No responses yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub: string }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-neutral-50 rounded-lg">
          {icon}
        </div>
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-neutral-500 italic">{sub}</div>
    </Card>
  );
}

function BarChartComponent({ data, options }: { data: any[]; options?: string[] }) {
  const counts: Record<string, number> = {};
  
  // Initialize counts for all options if provided
  if (options) {
    options.forEach(opt => counts[opt] = 0);
  }

  data.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          width={100}
          tick={{ fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
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
          outerRadius={80}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          formatter={(value) => <span className="text-xs text-neutral-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
