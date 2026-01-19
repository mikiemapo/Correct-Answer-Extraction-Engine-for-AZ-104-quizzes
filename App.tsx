
import React, { useState } from 'react';
import { ExtractionForm } from './components/ExtractionForm';
import { ResultView } from './components/ResultView';
import { extractCorrectAnswers } from './services/geminiService';
import { ExtractedQuestion, ExtractionStatus } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<ExtractedQuestion[]>([]);
  const [status, setStatus] = useState<ExtractionStatus>(ExtractionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleExtraction = async (text: string, domain: string) => {
    setStatus(ExtractionStatus.LOADING);
    setError(null);
    try {
      const data = await extractCorrectAnswers(text, domain);
      setResults(data);
      setStatus(ExtractionStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Failed to extract answers. Please check your data or try again.");
      setStatus(ExtractionStatus.ERROR);
    }
  };

  const handleClear = () => {
    setResults([]);
    setStatus(ExtractionStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              Q
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">QuizWise</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Extraction Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-600 transition-colors">AZ-104 Resources</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Structured Extraction Engine
          </h2>
          <p className="text-slate-500 max-w-2xl">
            Transform messy AZ-104 quiz results into structured data. Extract correctly answered items for Anki, NotebookLM, or custom knowledge bases.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs">1</span>
              Input & Configuration
            </div>
            <ExtractionForm onExtract={handleExtraction} isLoading={status === ExtractionStatus.LOADING} />
            
            {status === ExtractionStatus.ERROR && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs">2</span>
              Extracted Results
            </div>
            <ResultView results={results} onClear={handleClear} />
          </div>
        </div>
      </main>

      {/* Bottom Bar / CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 px-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-500">
          <p>© 2025 QuizWise Engine. Powered by Gemini 3 Flash.</p>
          <p>Privacy: Processing happens in-browser via API. No data stored on server.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
