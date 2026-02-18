
import React from 'react';
import { PredictionData, SellingRecommendation, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ExternalLink, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PredictionCardProps {
  data: PredictionData;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ data }) => {
  const isWait = data.recommendation === SellingRecommendation.WAIT;
  
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'bg-emerald-500';
      case RiskLevel.MEDIUM: return 'bg-amber-500';
      case RiskLevel.HIGH: return 'bg-rose-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
      {/* Dynamic Header */}
      <div className={`p-6 flex justify-between items-center ${isWait ? 'bg-indigo-600' : 'bg-emerald-600'} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="font-black text-xl leading-none flex items-center gap-2">
            {data.crop} Market Insight
          </h3>
          <p className="text-xs opacity-80 mt-1 font-bold tracking-widest uppercase">Verified Live Mandi Data</p>
        </div>
        <div className="bg-white text-gray-900 px-5 py-2 rounded-2xl font-black text-sm shadow-xl z-10 animate-pulse">
          {isWait ? 'ఆగండి (WAIT)' : 'అమ్మండి (SELL)'}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quality Section */}
        {data.qualityGrade && (
          <div className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0 mr-4 ${getRiskColor(RiskLevel.LOW)}`}>
              {data.qualityGrade}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Assessment</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">{data.qualityAssessment}</p>
            </div>
          </div>
        )}

        {/* Price Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">₹{data.currentPrice.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">/{data.unit}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Target Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-600">₹{data.predictedPrice.toLocaleString()}</span>
              <span className="text-xs font-bold text-indigo-400">/{data.unit}</span>
            </div>
          </div>
        </div>

        {/* Impact Message */}
        {isWait && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Potential Extra Profit</p>
              <p className="text-xl font-black text-emerald-600">+ ₹{data.profitDelta.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-600 p-3 rounded-xl shadow-lg shadow-emerald-200">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
          </div>
        )}

        {/* Trend Chart */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7-Day Prediction Trend</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400">RISK:</span>
              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black text-white ${getRiskColor(data.risk)}`}>
                {data.risk}
              </div>
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isWait ? "#4f46e5" : "#10b981"} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isWait ? "#4f46e5" : "#10b981"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="price" stroke={isWait ? "#4f46e5" : "#10b981"} strokeWidth={4} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-3">
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 relative">
             <div className="absolute -top-2 -left-2 bg-indigo-600 text-white p-1 rounded-lg">
                <CheckCircle2 size={12} />
             </div>
             <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                {data.explanation}
             </p>
          </div>
        </div>

        {/* Grounding Sources */}
        {data.sources && data.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.sources.slice(0, 3).map((s, idx) => (
              <a 
                key={idx} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center text-[9px] font-black bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-xl transition-all"
              >
                <ExternalLink className="w-2.5 h-2.5 mr-1" />
                MANDI SOURCE {idx + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;
