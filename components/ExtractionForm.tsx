
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { extractTextFromPdf } from '../services/pdfService';

interface ExtractionFormProps {
  onExtract: (text: string, domain: string) => void;
  isLoading: boolean;
}

const DOMAINS = [
  "Manage Azure identities and governance",
  "Implement and manage storage",
  "Deploy and manage Azure compute resources",
  "Configure and manage virtual networking",
  "Monitor and maintain Azure resources"
];

export const ExtractionForm: React.FC<ExtractionFormProps> = ({ onExtract, isLoading }) => {
  const [text, setText] = useState('');
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [customDomain, setCustomDomain] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'pdf'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let processedText = text;

    if (inputType === 'pdf') {
      if (!file) return;
      try {
        processedText = await extractTextFromPdf(file);
      } catch (err) {
        alert("Error reading PDF file. Please try pasting the text instead.");
        return;
      }
    }

    if (!processedText.trim()) return;
    onExtract(processedText, isCustom ? customDomain : domain);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          AZ-104 Domain Tag
        </label>
        <div className="flex gap-2 mb-2">
          <button 
            type="button" 
            onClick={() => setIsCustom(false)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${!isCustom ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            Predefined
          </button>
          <button 
            type="button" 
            onClick={() => setIsCustom(true)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${isCustom ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            Custom
          </button>
        </div>
        
        {isCustom ? (
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="e.g., Azure Governance & Management"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        ) : (
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
            style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem'}}
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-slate-700">
            Source Data
          </label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setInputType('pdf')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${inputType === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setInputType('text')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${inputType === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {inputType === 'pdf' ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer group relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${file ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 group-hover:text-blue-500'}`}>
              {file ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              )}
            </div>
            <p className={`text-sm font-medium ${file ? 'text-green-700' : 'text-slate-600'}`}>
              {file ? file.name : 'Click to upload PDF or drag and drop'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF files only, up to 10MB</p>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste raw quiz text content here..."
            className="w-full h-48 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
            required={inputType === 'text'}
          />
        )}
        <p className="mt-2 text-xs text-slate-500">
          Perfect for non-selectable text: Upload the PDF export of your quiz results.
        </p>
      </div>

      <Button type="submit" className="w-full py-3" isLoading={isLoading} disabled={inputType === 'pdf' && !file}>
        Extract Correct Answers
      </Button>
    </form>
  );
};
