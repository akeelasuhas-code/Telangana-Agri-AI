
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PredictionData, SellingRecommendation } from './types';
import { getMarketAnalysis, generateVoiceResponse } from './services/geminiService';
import { playPCM } from './services/audioService';
import PredictionCard from './components/PredictionCard';
import { Mic, Send, Camera, X, CheckCircle2, Search, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        sender: 'ai',
        text: 'నమస్కారం రైతు సోదరులారా! (Greetings Farmer!) మీ పంట అమ్మడానికి సరైన సమయం కోసం నన్ను అడగండి. మీరు మీ పంట ఫోటో తీసి కూడా పంపవచ్చు. (Ask me for the best time to sell. You can also send a photo for quality check.)',
        type: 'text',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text || (image ? "Analyzing this crop quality..." : ""),
      type: 'text',
      imageUrl: image,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Pass location as well if possible, defaulting to Telangana
      const prediction = await getMarketAnalysis(text || "Analyzing provided crop image for market price and quality.", image);
      
      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: prediction.explanation,
        type: 'prediction',
        prediction,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-play the voice recommendation in the detected language
      const voiceData = await generateVoiceResponse(prediction.explanationAudioScript);
      if (voiceData) await playPCM(voiceData);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'క్షమించండి, సాంకేతిక సమస్య ఏర్పడింది. మళ్ళీ ప్రయత్నించండి. (Sorry, an error occurred. Please try again.)',
        type: 'text',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return alert("Browser does not support voice input.");
    
    const rec = new Recognition();
    rec.lang = 'te-IN'; // Prioritize Telugu but browser handles mixed
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript, selectedImage || undefined);
    rec.onend = () => setIsRecording(false);
    rec.start();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-lg h-screen md:h-[850px] bg-white md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
        
        {/* Professional Header - Exact Match */}
        <header className="bg-[#047857] text-white px-6 py-5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">Raithu AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#34d399] rounded-full shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#a7f3d0]">Live Market Engine</span>
              </div>
            </div>
          </div>
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-[#065f46]' : 'text-white/60'}`}
            >
              Chat
            </button>
            <button 
              onClick={() => setActiveTab('form')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-white text-[#065f46]' : 'text-white/60'}`}
            >
              Form
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] ${m.type === 'prediction' ? 'w-full' : ''}`}>
                {m.imageUrl && (
                  <img src={m.imageUrl} className="w-full h-48 object-cover rounded-3xl mb-2 border-4 border-white shadow-lg" alt="Crop" />
                )}
                {m.type === 'text' && (
                  <div className={`p-4 rounded-3xl shadow-sm text-[15px] font-bold leading-relaxed ${
                    m.sender === 'user' ? 'bg-[#047857] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                )}
                {m.type === 'prediction' && m.prediction && (
                  <PredictionCard data={m.prediction} />
                )}
                <p className="text-[10px] font-black text-slate-400 mt-1.5 px-2 uppercase tracking-tighter">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 w-fit animate-pulse">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce delay-200"></div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching Mandis...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Unified Interaction Bar - Match Screenshot */}
        <footer className="bg-white p-6 border-t border-slate-100 space-y-4">
          {selectedImage && (
            <div className="relative w-20 h-20 group">
              <img src={selectedImage} className="w-full h-full object-cover rounded-2xl border-2 border-[#047857] shadow-xl" alt="Preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg border-2 border-white">
                <X size={12} />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-[#047857] transition-colors"
            >
              <Camera size={26} />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />

            <div className="flex-1 bg-[#f1f5f9] rounded-2xl px-5 py-3.5 flex items-center shadow-inner">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText, selectedImage || undefined)}
                placeholder="Type: 'Price for 10kg Tomato'..." 
                className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-600 placeholder:text-slate-400"
              />
            </div>

            <button 
              onClick={() => (inputText || selectedImage) ? handleSendMessage(inputText, selectedImage || undefined) : startVoiceInput()}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90 ${
                isRecording ? 'bg-rose-500 animate-pulse' : 'bg-[#1e293b] text-white'
              }`}
            >
              {(inputText || selectedImage) ? <Send size={24} /> : <Mic size={24} />}
            </button>
          </div>

          <div className="flex items-center justify-between px-2 opacity-60">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Regional AI</span>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <CheckCircle2 size={10} className="text-[#059669]" />
              <span className="text-[9px] font-black text-[#059669] uppercase tracking-widest">Trusted Advice</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ver 2.5</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
