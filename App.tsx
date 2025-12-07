import React, { useState } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import Processing from './components/Processing';
import ResultsView from './components/ResultsView';
import { AppState, Language } from './types';
import { INITIAL_LANGUAGE } from './constants';
import { analyzeDocument } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'capture',
    image: null,
    selectedLanguage: INITIAL_LANGUAGE,
    result: null,
    error: null,
  });

  const handleCapture = async (file: File) => {
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      setState(prev => ({ 
        ...prev, 
        step: 'processing', 
        image: base64,
        error: null 
      }));

      try {
        const result = await analyzeDocument(base64, state.selectedLanguage);
        setState(prev => ({
          ...prev,
          step: 'results',
          result: result
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          step: 'capture', // Go back to capture on error
          error: error.message || "Something went wrong. Please try again."
        }));
        alert("Failed to analyze document: " + (error.message || "Unknown error"));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setState(prev => ({
      ...prev,
      step: 'capture',
      image: null,
      result: null,
      error: null
    }));
    window.speechSynthesis.cancel();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full">
        {state.step === 'capture' && (
          <CameraCapture 
            onCapture={handleCapture}
            selectedLanguage={state.selectedLanguage}
            onLanguageChange={(lang) => setState(prev => ({ ...prev, selectedLanguage: lang }))}
          />
        )}

        {state.step === 'processing' && (
          <Processing />
        )}

        {state.step === 'results' && state.result && state.image && (
          <ResultsView 
            result={state.result}
            imageSrc={state.image}
            onRetake={handleRetake}
          />
        )}
      </main>
    </div>
  );
};

export default App;