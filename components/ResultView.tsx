
import React, { useState } from 'react';
import { ExtractedQuestion } from '../types';
import { Button } from './Button';

interface ResultViewProps {
  results: ExtractedQuestion[];
  onClear: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ results, onClear }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownloadCSV = () => {
    const headers = ["Domain", "Question Summary", "Correct Answer", "Explanation"];
    const rows = results.map(q => [
      `"${q.domain.replace(/"/g, '""')}"`,
      `"${q.question_summary.replace(/"/g, '""')}"`,
      `"${q.correct_answer.replace(/"/g, '""')}"`,
      `"${q.explanation.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extracted_answers_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extracted_answers_${new Date().getTime()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700">No results yet</h3>
          <p className="text-slate-500">Paste your quiz data and start extraction to see results here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {results.length} Correct Answers Found
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyJSON}>
            {copyStatus === 'copied' ? 'Copied!' : 'Copy JSON'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            CSV
          </Button>
          <Button variant="danger" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2">
        {results.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Question {idx + 1}
              </span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {item.domain}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-slate-800 mb-3 leading-snug">
              {item.question_summary}
            </h4>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
              <span className="text-xs font-bold text-green-700 block mb-1">Correct Answer</span>
              <p className="text-sm text-green-800 font-medium">{item.correct_answer}</p>
            </div>
            {item.explanation && (
              <div className="text-sm text-slate-600 border-l-2 border-slate-200 pl-4 py-1 italic">
                {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
