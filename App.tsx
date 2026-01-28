
import React, { useState, useRef, useCallback } from 'react';
import { EditedImage, ProcessingState } from './types';
import { editProductImage } from './services/geminiService';
import { downloadImage } from './utils/imageHelpers';
import Button from './components/Button';
import HistoryItem from './components/HistoryItem';

const PRESETS = [
  "Remove background",
  "Add white studio background",
  "Fix lighting and shadows",
  "Enhance product colors",
  "Add a dramatic shadow",
  "Add retro film filter"
];

function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<EditedImage[]>([]);
  const [activeItem, setActiveItem] = useState<EditedImage | null>(null);
  const [prompt, setPrompt] = useState("");
  const [processing, setProcessing] = useState<ProcessingState>({ 
    isProcessing: false, 
    message: "" 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setActiveItem(null);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProcessImage = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!originalImage || !targetPrompt.trim()) return;

    setProcessing({ isProcessing: true, message: "Analyzing and editing image..." });
    
    try {
      const resultUrl = await editProductImage(originalImage, targetPrompt);
      
      if (resultUrl) {
        const newItem: EditedImage = {
          id: crypto.randomUUID(),
          originalUrl: URL.createObjectURL(originalImage),
          editedUrl: resultUrl,
          prompt: targetPrompt,
          timestamp: Date.now()
        };
        
        setHistory(prev => [newItem, ...prev]);
        setActiveItem(newItem);
        setPrompt("");
      }
    } catch (error) {
      alert("Failed to edit image. Please try again.");
    } finally {
      setProcessing({ isProcessing: false, message: "" });
    }
  };

  const handleDownload = () => {
    const url = activeItem?.editedUrl || previewUrl;
    if (url) {
      downloadImage(url, `snapclean-edit-${Date.now()}.png`);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setPreviewUrl(null);
    setActiveItem(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar: History and Presets */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">SnapClean AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {history.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Edits</h2>
              <div className="space-y-2">
                {history.map(item => (
                  <HistoryItem 
                    key={item.id} 
                    item={item} 
                    isActive={activeItem?.id === item.id}
                    onClick={setActiveItem} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No edits yet. Upload an image to start transforming your photos.</p>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  disabled={!originalImage || processing.isProcessing}
                  onClick={() => handleProcessImage(preset)}
                  className="px-4 py-2 text-sm text-left font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReset}
            disabled={!originalImage}
          >
            Start New Project
          </Button>
        </div>
      </aside>

      {/* Main Content: Editor Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 gap-8 relative overflow-y-auto h-screen">
        {/* Workspace Card */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col relative group">
          
          {/* Main Image Display */}
          <div className="flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center p-8">
            {!previewUrl ? (
              <div 
                onClick={triggerFileUpload}
                className="max-w-md w-full aspect-square border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group/upload"
              >
                <div className="bg-indigo-100 p-6 rounded-2xl text-indigo-600 group-hover/upload:scale-110 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">Upload Product Photo</p>
                  <p className="text-slate-500 mt-2">Drag and drop or click to browse</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                <img 
                  src={activeItem ? activeItem.editedUrl : previewUrl} 
                  alt="Preview" 
                  className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${processing.isProcessing ? 'opacity-30' : 'opacity-100'}`}
                />
                
                {processing.isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-900">
                    <div className="relative">
                       <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="font-semibold text-lg">{processing.message}</p>
                    <p className="text-sm text-slate-500 animate-pulse italic">Thinking like a pro editor...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar (Only if image uploaded) */}
          {previewUrl && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={triggerFileUpload} disabled={processing.isProcessing}>
                  Replace Image
                </Button>
                {activeItem && (
                   <div className="hidden sm:flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                      EDITED RESULT
                   </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={handleDownload} disabled={processing.isProcessing}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
                  </svg>
                  Download Result
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Input Control */}
        <div className="w-full max-w-3xl mx-auto z-10 sticky bottom-4">
          <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-indigo-200/50 border border-slate-200 flex gap-2">
            <input 
              type="text" 
              placeholder={originalImage ? "Type instruction: 'Remove background', 'Add a shadow', etc..." : "Upload an image first to start editing"}
              disabled={!originalImage || processing.isProcessing}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcessImage()}
              className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-700 font-medium placeholder:text-slate-400 disabled:opacity-50"
            />
            <Button 
              onClick={() => handleProcessImage()}
              disabled={!originalImage || !prompt.trim() || processing.isProcessing}
              isLoading={processing.isProcessing}
              className="px-8 rounded-xl"
            >
              Run AI
            </Button>
          </div>
          <p className="text-center mt-3 text-xs text-slate-400 font-medium tracking-wide flex items-center justify-center gap-2 uppercase">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Powered by Gemini 2.5 Flash Image
          </p>
        </div>
      </main>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
}

export default App;
