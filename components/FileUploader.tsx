import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, PenTool } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File, instructions: string) => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isAnalyzing, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [instructions, setInstructions] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelected(file, instructions);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }, [onFileSelected, instructions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0], instructions);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 rounded-t-2xl border-2 border-dashed border-b-0 transition-all duration-300 ease-in-out
          ${isAnalyzing ? 'bg-slate-50 border-slate-300 cursor-wait' : 
            dragActive ? 'bg-brand-50 border-brand-500 scale-[1.01]' : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-brand-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          onChange={handleChange}
          accept="application/pdf"
          disabled={isAnalyzing}
        />
        
        <div className="text-center px-6 pointer-events-none">
          {isAnalyzing ? (
            <div className="flex flex-col items-center animate-pulse">
              <div className="h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Engineering Review in Progress...</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs">
                Phase 1: Extracting Data<br/>
                Phase 2: <span className="font-semibold text-brand-600">Senior Engineer Double-Check</span>
              </p>
            </div>
          ) : (
            <>
              <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${dragActive ? 'bg-brand-100' : 'bg-slate-100'}`}>
                <UploadCloud className={`h-8 w-8 ${dragActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Submittal PDF</h3>
              <p className="mt-2 text-sm text-slate-500">
                Drag and drop or click to select
              </p>
            </>
          )}
        </div>
      </div>

      {/* Instructions Input */}
      <div className={`bg-white border-2 border-t-0 border-dashed border-slate-300 rounded-b-2xl p-4 transition-all duration-300 ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'hover:border-brand-400'}`}>
        <div className="flex items-start gap-3">
          <PenTool className="h-5 w-5 text-slate-400 mt-2" />
          <div className="flex-grow">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Specific Review Focus (Optional)</label>
            <input 
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., Check for Seismic Anchorage, Verify Buy American Act, Confirm 208V compatibility..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
              disabled={isAnalyzing}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Analysis Failed</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};