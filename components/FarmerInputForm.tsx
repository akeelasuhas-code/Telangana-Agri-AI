
import React, { useState } from 'react';
import { Send, MapPin, Package, Sprout } from 'lucide-react';

interface FarmerInputFormProps {
  onSubmit: (crop: string, qty: number, loc: string) => void;
  isLoading: boolean;
}

const COMMON_CROPS = ['Paddy (వరి)', 'Tomato (టమోటా)', 'Cotton (ప్రత్తి)', 'Chili (మిర్చి)', 'Turmeric (పసుపు)'];
const COMMON_LOCATIONS = ['Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Mahabubnagar'];

const FarmerInputForm: React.FC<FarmerInputFormProps> = ({ onSubmit, isLoading }) => {
  const [crop, setCrop] = useState('');
  const [qty, setQty] = useState('');
  const [loc, setLoc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (crop && qty && loc) {
      onSubmit(crop, Number(qty), loc);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 border-2 border-green-100 space-y-5">
      <h2 className="text-xl font-bold text-green-800 flex items-center">
        <Sprout className="mr-2" />
        New Selling Advice
      </h2>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Crop Name (పంట పేరు)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_CROPS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCrop(c.split(' (')[0])}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${crop === c.split(' (')[0] ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="e.g. Tomato"
            required
          />
          <Sprout className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Quantity (పరిమాణం - Quintals/Bags)</label>
          <div className="relative">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="100"
              required
            />
            <Package className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location (ప్రాంతం)</label>
          <div className="relative">
            <input
              type="text"
              list="locations"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Warangal"
              required
            />
            <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <datalist id="locations">
              {COMMON_LOCATIONS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center text-lg"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            Analyzing Market...
          </div>
        ) : (
          <div className="flex items-center">
            Get Market Advice (సలహా పొందండి)
            <Send className="ml-2 w-5 h-5" />
          </div>
        )}
      </button>
    </form>
  );
};

export default FarmerInputForm;
