
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PredictionData } from './types';
import { getMarketAnalysis, generateVoiceResponse, parseFarmerQuery } from './services/geminiService';
import { playPCM } from './services/audioService';
import PredictionCard from './components/PredictionCard';
import FarmerInputForm from './components/FarmerInputForm';
import { Mic, Volume2, Info, Share2, Send, MessageSquare, LayoutDashboard, Sprout, Camera, X, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        sender: 'ai',
        text: 'నమస్కారం రైతు సోదరులారా! (Greetings Farmer!)\n\nమీ పంట అమ్మడానికి సరైన సమయం కోసం నన్ను అడగండి. మీరు మీ పంట ఫోటో తీసి కూడా పంపవచ్చు.\n\n(Ask me for the best time to sell. You can also send a photo for quality check.)',
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

  const handleAnalysis = async (crop: string, qty: number, unit: 'kg' | 'quintal' | 'bags', loc: string, image?: string) => {
    setIsLoading(true);
    try {
      const prediction = await getMarketAnalysis(crop, qty, unit, loc, image);
      
      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: prediction.recommendation === 'WAIT' 
          ? `సలహా: ధరలు పెరిగే అవకాశం ఉంది, ${prediction.daysToWait} రోజులు ఆగండి.` 
          : `సలహా: ఇప్పుడే అమ్మండి, మార్కెట్ ధర బాగుంది.`,
        type: 'prediction',
        prediction,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      const voiceData = await generateVoiceResponse(prediction.explanationTelugu);
      if (voiceData) await playPCM(voiceData);
    } catch (error) {
      console.error("Analysis Failed:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'క్షమించండి, సర్వర్ సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
        type: 'text',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text || "Analyzing your crop image...",
      type: 'text',
      imageUrl: image,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    // Contextual extraction
    const parsed = await parseFarmerQuery(text || "Tomato quality scan");
    
    if (parsed) {
      await handleAnalysis(parsed.crop, parsed.quantity, parsed.unit, parsed.location, image);
    } else {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I couldn't quite catch the crop name or location. Please say something like: 'Price for 50kg Potato in Hyderabad'",
        type: 'text',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'te-IN';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => handleSendMessage(event.results[0][0].transcript, selectedImage || undefined);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] max-w-lg mx-auto border-x border-slate-200 shadow-2xl overflow-hidden font-sans">
      {/* Premium Header */}
      <header className="bg-emerald-700 text-white px-5 py-4 shadow-xl z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <Sprout className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none">Raithu AI</h1>
            <div className="flex items-center mt-1">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Live Market Engine</p>
            </div>
          </div>
        </div>
        <div className="flex bg-black/10 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setView('chat')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'chat' ? 'bg-white text-emerald-800 shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setView('dashboard')} 
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-white text-emerald-800 shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Form
          </button>
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-[linear-gradient(to_bottom,#f8fafc_0%,#eff6ff_100%)]">
        {view === 'chat' ? (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[94%] ${msg.type === 'prediction' ? 'w-full' : ''}`}>
                  {msg.imageUrl && (
                    <div className="mb-2 relative rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                      <img src={msg.imageUrl} alt="Crop" className="w-full h-48 object-cover" />
                    </div>
                  )}
                  {msg.type === 'text' && (
                    <div className={`p-4 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                  {msg.type === 'prediction' && msg.prediction && (
                    <PredictionCard data={msg.prediction} />
                  )}
                  <div className={`text-[9px] mt-1 px-2 font-bold uppercase tracking-tighter ${msg.sender === 'user' ? 'text-emerald-700/50' : 'text-slate-400'} text-right`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-5 py-3 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checking Mandi Data</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <FarmerInputForm 
              onSubmit={(c, q, l) => {
                setView('chat');
                handleSendMessage(`Price for ${q} quintals of ${c} in ${l}`, selectedImage || undefined);
              }} 
              isLoading={isLoading} 
            />
            {selectedImage && (
              <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-dashed border-emerald-200 text-center">
                 <img src={selectedImage} className="w-full h-40 object-cover rounded-2xl mb-3 shadow-inner" alt="Selected" />
                 <button onClick={() => setSelectedImage(null)} className="text-rose-500 text-xs font-black uppercase flex items-center justify-center mx-auto">
                   <X className="w-4 h-4 mr-1" /> Remove Image
                 </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Interaction Bar */}
      <footer className="bg-white p-4 border-t border-slate-100 pb-8">
        {view === 'chat' && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all active:scale-90"
            >
              <Camera className="w-6 h-6" />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />

            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type: 'Price for 10kg Tomato'..." 
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText, selectedImage || undefined)}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-2.5">
                {selectedImage && <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-emerald-500"><img src={selectedImage} className="w-full h-full object-cover" /></div>}
              </div>
            </div>
            
            <button 
              onClick={() => inputText.trim() || selectedImage ? handleSendMessage(inputText, selectedImage || undefined) : handleVoiceInput()}
              className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isRecording ? 'bg-rose-500 animate-pulse' : (inputText.trim() || selectedImage ? 'bg-emerald-600' : 'bg-slate-800')} text-white`}
            >
              {inputText.trim() || selectedImage ? <Send className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        )}
        <div className="flex justify-around items-center pt-5">
           <div className="flex flex-col items-center opacity-30">
             <div className="w-1 h-1 bg-slate-400 rounded-full mb-1"></div>
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Regional AI</p>
           </div>
           <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
             <CheckCircle2 className="w-3 h-3 text-emerald-600" />
             <span className="text-[10px] font-bold text-emerald-800 uppercase">Trusted Advice</span>
           </div>
           <div className="flex flex-col items-center opacity-30">
             <div className="w-1 h-1 bg-slate-400 rounded-full mb-1"></div>
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ver 2.5</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
