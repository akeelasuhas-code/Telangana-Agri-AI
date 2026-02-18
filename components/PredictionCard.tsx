
import React from 'react';
import { PredictionData, SellingRecommendation, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Info, AlertCircle, IndianRupee, ExternalLink, ShieldCheck, Target } from 'lucide-react';

interface PredictionCardProps {
  data: PredictionData;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ data }) => {
  const isWait = data.recommendation === SellingRecommendation.WAIT;
  const riskColor = {
    [RiskLevel.LOW]: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    [RiskLevel.MEDIUM]: 'text-amber-600 bg-amber-50 border-amber-100',
    [RiskLevel.HIGH]: 'text-rose-600 bg-rose-50 border-rose-100',
  }[data.risk];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
      <div className={`p-5 flex justify-between items-center ${isWait ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}>
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">{data.crop} Market Advice</h3>
            <p className="text-xs opacity-80 mt-1">Based on live Mandi prices</p>
          </div>
        </div>
        <div className="bg-white text-gray-900 px-4 py-1.5 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
          {isWait ? 'ఆగండి (WAIT)' : 'అమ్మండి (SELL)'}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {data.qualityGrade && (
          <div className="flex items-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mr-4 shrink-0">
              {data.qualityGrade}
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Visual Quality Grade</p>
              <p className="text-sm text-indigo-700 leading-tight">{data.qualityAssessment}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Today's Price</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-gray-800">₹{data.currentPrice.toLocaleString()}</span>
              <span className="text-xs text-gray-500">/{data.unit}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Price</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-indigo-600">₹{data.predictedPrice.toLocaleString()}</span>
              <span className="text-xs text-indigo-400">/{data.unit}</span>
            </div>
          </div>
        </div>

        {isWait && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase">Potential Extra Profit</p>
              <p className="text-lg font-black text-emerald-600">+ ₹{data.profitDelta.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-600 p-2 rounded-full">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
          </div>
        )}

        <div className="h-44 w-full bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Price Trend (1 Week)</p>
            <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${riskColor}`}>
              Risk: {data.risk}
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trendData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isWait ? "#4f46e5" : "#10b981"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isWait ? "#4f46e5" : "#10b981"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="price" stroke={isWait ? "#4f46e5" : "#10b981"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
          <div className="flex items-start space-x-2">
            <div className="bg-emerald-100 p-1 rounded-md mt-0.5">
              <Volume2 className="w-3 h-3 text-emerald-700" />
            </div>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {data.explanationTelugu}
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-[10px] text-gray-400 italic font-medium leading-snug">
              {data.explanation}
            </p>
          </div>
        </div>

        {data.sources && data.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.sources.map((s, idx) => (
              <a 
                key={idx} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center text-[9px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded-lg transition-all"
              >
                <ExternalLink className="w-2.5 h-2.5 mr-1" />
                Mandis Link {idx + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for the volume icon not imported previously
const Volume2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export default PredictionCard;
