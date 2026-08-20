import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/api';
import { AnalyticsData } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BarChart3, TrendingUp, Clock, ShieldCheck, 
  Droplets, Building2, Bed, AlertTriangle, Users 
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading health intelligence metrics...
      </div>
    );
  }

  const { metrics, risk_distribution, diagnosis_distribution, weekly_trends, hospital_performance } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Maternal Health Mission & Referral Analytics
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                DISTRICT DASHBOARD
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated inter-facility transfer patterns, clinical response times, and mortality prevention metrics.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-400">District: Pune Region</span>
          <div className="text-[11px] text-emerald-600 font-bold">● Active Reporting: 100% PHCs/CHCs</div>
        </div>
      </div>

      {/* TOP 4 KEY PERFORMANCE TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Referrals</span>
            <Users className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {metrics.total_referrals}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span className="text-rose-600 font-bold">{metrics.high_risk_cases} High Risk</span> • {metrics.medium_risk_cases} Medium • {metrics.low_risk_cases} Low
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Prep Lead Time Gained</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {metrics.avg_preparation_lead_time_min} <span className="text-base font-normal">min</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Advance hospital preparation before ambulance arrival
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hospital Preparedness Rate</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {metrics.overall_preparedness_rate}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Specialist + Blood + ICU pre-staged compliance
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Transit Time</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {metrics.avg_transit_duration_min} <span className="text-base font-normal">min</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Origin PHC to Destination Hospital gate
          </p>
        </div>
      </div>

      {/* CHARTS GRID ROW 1: WEEKLY REFERRAL TRENDS + RISK DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Referral Volume & High Risk Trajectory
              </h2>
              <p className="text-xs text-slate-500">Emergency cases referred across 7-day rolling window</p>
            </div>
            <span className="text-xs text-primary-600 font-semibold">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly_trends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="total" name="Total Referrals" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="high_risk" name="High Risk MEOWS" stroke="#EF4444" fillOpacity={1} fill="url(#colorHigh)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MEOWS Risk Stratification Pie (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              MEOWS Clinical Risk Stratification
            </h2>
            <p className="text-xs text-slate-500">Distribution of physiological deterioration scores</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {risk_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 2: PRIMARY MATERNAL COMPLICATIONS & HOSPITAL PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Complications Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Top Maternal Emergency Indications
            </h2>
            <p className="text-xs text-slate-500">Breakdown of primary clinical transfer triggers</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosis_distribution} layout="vertical">
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" width={140} stroke="#94A3B8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Case Count" fill="#2563EB" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hospital Performance Table (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Receiving Facility Readiness Compliance
            </h2>
            <p className="text-xs text-slate-500">Hospital response speed and bed/blood readiness rate</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Hospital</th>
                  <th className="p-2.5">Received</th>
                  <th className="p-2.5">High Risk</th>
                  <th className="p-2.5">ICU Free</th>
                  <th className="p-2.5 rounded-r-lg">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hospital_performance.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">
                      {hosp.name}
                    </td>
                    <td className="p-2.5 font-bold">{hosp.total_received}</td>
                    <td className="p-2.5 text-rose-600 font-bold">{hosp.high_risk_received}</td>
                    <td className="p-2.5 text-blue-600 font-bold">{hosp.available_icu}</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{hosp.compliance_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
