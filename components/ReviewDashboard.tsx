import React, { useState } from 'react';
import { SubmittalData, ReviewStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle, AlertTriangle, XCircle, Info, Mail, FileText, Save, X, Printer, Copy, Check, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { ChatWidget } from './ChatWidget';
import { useUserProfile } from '../App';

interface ReviewDashboardProps {
  data: SubmittalData;
  fileName: string;
  fileData: string; // base64
  mimeType: string;
}

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ data, fileName, fileData, mimeType }) => {
  const [responseText, setResponseText] = useState(data.draftResponse);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { userProfile } = useUserProfile();

  const handlePrintPDF = () => {
    // Small timeout to ensure any state updates render before print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getEmailSignature = () => {
    if (!userProfile.name) return '';
    let sig = `%0D%0A%0D%0A--%0D%0A${encodeURIComponent(userProfile.name)}`;
    if (userProfile.title) sig += `%0D%0A${encodeURIComponent(userProfile.title)}`;
    if (userProfile.company) sig += `%0D%0A${encodeURIComponent(userProfile.company)}`;
    return sig;
  };

  const handleEmail = () => {
    const subject = `Submittal Review: ${data.submittalNumber} - ${data.recommendedStatus}`;
    const body = `Submittal Number: ${data.submittalNumber}%0D%0A` +
                 `Spec Section: ${data.specSection}%0D%0A` +
                 `Description: ${data.description}%0D%0A%0D%0A` +
                 `Review Status: ${data.recommendedStatus}%0D%0A%0D%0A` +
                 `Engineer Comments:%0D%0A${encodeURIComponent(responseText)}%0D%0A%0D%0A` +
                 `Next Steps:%0D%0A${encodeURIComponent(data.nextSteps)}` +
                 getEmailSignature();
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  const handleCopyResponse = () => {
    const text = `Submittal Review: ${data.submittalNumber}
Status: ${data.recommendedStatus}

Engineer Comments:
${responseText}

Next Steps:
${data.nextSteps}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportLog = () => {
    const headers = ['Submittal Number', 'Spec Section', 'Description', 'Manufacturer', 'Status', 'Review Date', 'Contract Number', 'Reviewer Comments', 'Next Steps'];
    
    // Clean up text for CSV (escape quotes)
    const escapeCsv = (str: string) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""')}"`; // Escape double quotes
    };

    const row = [
      data.submittalNumber,
      data.specSection,
      data.description,
      data.manufacturer,
      data.recommendedStatus,
      new Date().toLocaleDateString(),
      data.contractNumber,
      responseText, // Use the potentially edited response
      data.nextSteps
    ].map(escapeCsv).join(',');

    const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n${row}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Submittal_Log_${data.submittalNumber || 'Entry'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveResponse = () => {
    setIsEditing(false);
    // In a real app, you would save this to the backend here
  };

  const handleCancelEdit = () => {
    setResponseText(data.draftResponse);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Top Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-2xl font-bold text-slate-900">Review Analysis</h2>
             <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                <ShieldCheck className="h-3 w-3" />
                AI Double-Check Verified
             </div>
          </div>
          <p className="text-slate-500 flex items-center gap-2">
            <FileText className="h-4 w-4" /> {fileName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <button 
            onClick={handleCopyResponse}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
            title="Copy review summary to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          
          <button 
            onClick={handleExportLog}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
            title="Download CSV for Submittal Log"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export to Log
          </button>

          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
          
          <button 
            onClick={handleEmail}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            Email Contractor
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print-only-visible mb-8">
          <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Submittal Review Report</h1>
              <p className="text-slate-600 text-sm mt-1">Generated by SubmittalCheck AI</p>
            </div>
            <div className="text-right">
               <p className="text-sm text-slate-900 font-bold">Date: {new Date().toLocaleDateString()}</p>
               <p className="text-sm text-slate-600">File: {fileName}</p>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Meta & Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-brand-500 border-x border-b border-slate-200 p-6 break-inside-avoid print:border-slate-300 group hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Recommendation</h3>
            <div className="flex flex-col items-center text-center">
              <StatusBadge status={data.recommendedStatus} large />
              <p className="mt-4 text-sm text-slate-600">Based on analysis of {data.compliance?.conflicts?.length || 0} potential conflicts and completeness checks.</p>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-slate-400 border-x border-b border-slate-200 overflow-hidden break-inside-avoid print:border-slate-300 group hover:shadow-md transition-shadow">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 print:bg-gray-100">
              <h3 className="text-sm font-semibold text-slate-700">Submittal Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Submittal #</label>
                <div className="text-slate-900 font-medium">{data.submittalNumber}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Spec Section</label>
                <div className="text-slate-900 font-medium">{data.specSection}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Manufacturer</label>
                <div className="text-slate-900 font-medium">{data.manufacturer}</div>
              </div>
               <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Contract #</label>
                <div className="text-slate-900 font-medium">{data.contractNumber}</div>
              </div>
            </div>
          </div>

           {/* Completeness Card */}
           <div className="bg-white rounded-xl shadow-sm border-t-4 border-emerald-500 border-x border-b border-slate-200 overflow-hidden break-inside-avoid print:border-slate-300 group hover:shadow-md transition-shadow">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center print:bg-gray-100">
              <h3 className="text-sm font-semibold text-slate-700">Completeness</h3>
              {data.completeness.isComplete ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div className="p-6">
               {data.completeness.missingFiles && data.completeness.missingFiles.length > 0 && (
                 <div className="mb-4">
                   <span className="text-xs font-bold text-rose-600 uppercase">Missing Files</span>
                   <ul className="mt-1 space-y-1">
                     {data.completeness.missingFiles.map((item, idx) => (
                       <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                         <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 shrink-0"></span>
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
               {data.completeness.missingDetails && data.completeness.missingDetails.length > 0 && (
                 <div>
                   <span className="text-xs font-bold text-amber-600 uppercase">Missing Details</span>
                   <ul className="mt-1 space-y-1">
                     {data.completeness.missingDetails.map((item, idx) => (
                       <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                         <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0"></span>
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
               {data.completeness.isComplete && (
                 <p className="text-sm text-slate-500 italic">All required documents and details appear to be present.</p>
               )}
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Compliance & Issues */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-brand-600 border-x border-b border-slate-200 overflow-hidden break-inside-avoid print:border-slate-300 group hover:shadow-md transition-shadow">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 print:bg-gray-100">
              <h3 className="text-lg font-semibold text-slate-800">Technical Compliance Review</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-brand-500 print:text-slate-800" />
                  Material Description
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 print:bg-white print:border-none print:p-0 print:text-slate-800">
                  {data.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="break-inside-avoid">
                  <h4 className="text-sm font-bold text-slate-900 mb-2 text-rose-700">Identified Issues</h4>
                   {data.issues && data.issues.length > 0 ? (
                      <ul className="space-y-2">
                        {data.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                             <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 print:text-rose-700" />
                             {issue}
                          </li>
                        ))}
                      </ul>
                   ) : (
                     <p className="text-sm text-slate-500">No major issues identified.</p>
                   )}
                </div>
                
                <div className="break-inside-avoid">
                  <h4 className="text-sm font-bold text-slate-900 mb-2 text-brand-700">Applicable Spec Clauses</h4>
                  {data.compliance.applicableClauses && data.compliance.applicableClauses.length > 0 ? (
                      <ul className="space-y-2">
                        {data.compliance.applicableClauses.map((clause, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                             <CheckCircle className="h-4 w-4 text-brand-500 shrink-0 mt-0.5 print:text-slate-800" />
                             {clause}
                          </li>
                        ))}
                      </ul>
                   ) : (
                     <p className="text-sm text-slate-500">No specific clauses cited in review.</p>
                   )}
                </div>
              </div>
              
            </div>
          </div>

          {/* Draft Response (Editable) */}
          <div className="bg-white rounded-xl shadow-sm border-t-4 border-amber-400 border-x border-b border-slate-200 overflow-hidden break-inside-avoid print:border-slate-300 group hover:shadow-md transition-shadow">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center print:bg-gray-100">
              <h3 className="text-lg font-semibold text-slate-800">Engineer Response</h3>
              
              {!isEditing ? (
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 no-print"
                 >
                   <FileText className="h-3 w-3" /> Edit Response
                 </button>
              ) : (
                <div className="flex items-center gap-2 no-print">
                  <button 
                    onClick={handleCancelEdit}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                  <button 
                    onClick={handleSaveResponse}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {/* The container is styled differently for print to ensure text shows even if editing on screen */}
              <div className={`bg-amber-50 border border-amber-100 rounded-md ${isEditing ? 'p-0' : 'p-4'} print:bg-white print:border-0 print:p-0`}>
                
                {/* Edit Mode: Textarea - Hidden in Print */}
                {isEditing && (
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full h-48 p-3 text-sm text-slate-800 bg-amber-50 border-0 focus:ring-2 focus:ring-amber-300 resize-y outline-none block print:hidden"
                    autoFocus
                  />
                )}
                
                {/* Read Mode OR Print Mode: Text Display - Force Visible in Print */}
                <div className={`${isEditing ? 'hidden print-only-visible' : 'block'} print:block`}>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {responseText}
                  </p>
                </div>

              </div>
              
              <div className="mt-6 break-inside-avoid">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Suggested Next Steps</h4>
                <p className="text-sm text-slate-600">{data.nextSteps}</p>
              </div>
            </div>
          </div>

          {/* Signature Block - Print Only */}
          <div className="hidden print-only-visible mt-12 pt-12 border-t border-slate-300 break-inside-avoid">
             <div className="flex justify-between items-end">
               <div className="w-64 border-t border-slate-900 pt-2">
                 <p className="text-sm font-bold text-slate-900">
                    Reviewed By: {userProfile.name ? userProfile.name : '_______________________'}
                 </p>
                 {userProfile.title && <p className="text-xs text-slate-600 mt-1">{userProfile.title}</p>}
               </div>
               <div className="w-48 border-t border-slate-900 pt-2">
                 <p className="text-sm font-bold text-slate-900">Date</p>
               </div>
             </div>
             <div className="mt-8 text-xs text-slate-400 text-center">
               <p>Disclaimer: This document was assisted by SubmittalCheck AI. The engineer of record is responsible for final review and approval.</p>
             </div>
          </div>

        </div>
      </div>
      
      <div className="no-print chat-widget-container">
        <ChatWidget fileData={fileData} mimeType={mimeType} />
      </div>
      
    </div>
  );
};