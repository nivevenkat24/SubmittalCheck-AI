import React from 'react';
import { FileText, Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SubmittalCheck AI</h1>
              <p className="text-xs text-slate-500 font-medium">Automated Submittal Reviewer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};