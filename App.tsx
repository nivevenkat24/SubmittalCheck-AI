import React, { useState, createContext, useContext } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ReviewDashboard } from './components/ReviewDashboard';
import { SubmittalData, SubmittalFile } from './types';
import { analyzeSubmittalPDF } from './services/geminiService';
import { ArrowLeft } from 'lucide-react';

// --- User Profile Context Definitions ---

export interface UserProfile {
  name: string;
  title: string;
  company: string;
}

interface UserProfileContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

const UserProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Mock user profile - in a real app this would come from auth/DB
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    title: 'Senior Project Engineer',
    company: 'Apex Construction Solutions'
  });

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

// --- Main Application Content ---

function AppContent() {
  const [currentFile, setCurrentFile] = useState<SubmittalFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File, instructions: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert to base64 for Gemini
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          // Remove Data URL prefix for API
          const base64Data = result.split(',')[1]; 
          resolve(base64Data);
        };
        reader.onerror = error => reject(error);
      });

      // Pass the custom instructions to the analysis service
      const analysis = await analyzeSubmittalPDF(base64, file.type, instructions);

      setCurrentFile({
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date(),
        status: 'completed',
        data: analysis,
        fileData: base64, // Store base64 for Chat
        mimeType: file.type
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the document. Please ensure it is a valid PDF and try again.");
      setCurrentFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-50 to-transparent -z-10 opacity-70"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute top-32 -left-32 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>

      <Header />
      
      <main className="flex-grow relative z-0">
        {!currentFile ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                Review Submittals in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Seconds</span>
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Upload a contractor's PDF submittal to automatically verify compliance, check for missing details, and generate engineer comments using AI.
              </p>
            </div>
            
            <FileUploader 
              onFileSelected={handleFileSelect} 
              isAnalyzing={isAnalyzing}
              error={error}
            />

            {/* Mock Integration Badges */}
            <div className="mt-20 flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Seamless Workflow Integration</p>
              <div className="flex gap-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-3 group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="h-10 w-10 group-hover:scale-110 transition-transform" alt="Drive" />
                    <span className="font-semibold text-slate-700 hidden md:block">Drive</span>
                </div>
                 <div className="flex items-center gap-3 group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" className="h-10 w-10 group-hover:scale-110 transition-transform" alt="Docs" />
                    <span className="font-semibold text-slate-700 hidden md:block">Docs</span>
                </div>
                 <div className="flex items-center gap-3 group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" className="h-10 w-10 group-hover:scale-110 transition-transform" alt="Sheets" />
                    <span className="font-semibold text-slate-700 hidden md:block">Sheets</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-7xl mx-auto px-4 pt-6">
              <button 
                onClick={handleReset}
                className="flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Upload Another
              </button>
            </div>
            {currentFile.data && (
              <ReviewDashboard 
                key={currentFile.id}
                data={currentFile.data} 
                fileName={currentFile.name}
                fileData={currentFile.fileData || ''}
                mimeType={currentFile.mimeType || 'application/pdf'}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-100/80 backdrop-blur-sm border-t border-slate-200 py-6 no-print mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            Disclaimer: This AI tool can make mistakes. Engineers must perform independent verification and use the AI-generated output only as a starting point. Do not rely solely on this application for official submittal reviews or engineering decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Root Component wrapping content with Providers
export default function App() {
  return (
    <UserProfileProvider>
      <AppContent />
    </UserProfileProvider>
  );
}